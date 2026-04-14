import Screen from "@/components/Screen";
import { Button } from "@/components/ui";
import { useLanguage } from "@/context/LanguageContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { predictDiseaseWithImages } from "./api";

const MAX_IMAGES = 5;

type CropItem = { name: string; symbol: string; label?: string };

export default function CropUploadScreen() {
  const { translate } = useLanguage();
  const [images, setImages] = useState<{ uri: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [cropList, setCropList] = useState<CropItem[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [showCropPicker, setShowCropPicker] = useState(false);
  const [ui, setUi] = useState({
    back: "Back",
    title: "Upload Crop Images",
    subtitle: `Max ${MAX_IMAGES} images`,
    uploadButton: "+ Camera or Gallery",
    processing: "Processing...",
    submit: "Submit",
    permissionDenied: "Permission denied",
    allowPhotos: "Please allow access to your photos.",
    allowCamera: "Please allow access to your camera.",
    limitReached: "Limit reached",
    maxImagesMsg: `You can upload a maximum of ${MAX_IMAGES} images.`,
    uploadImage: "Upload Image",
    chooseSource: "Choose a source",
    camera: "Camera",
    gallery: "Gallery",
    cancel: "Cancel",
    noImageSelected: "No image selected",
    uploadAtLeastOne: "Please upload at least one image.",
    error: "Error",
    failedToProcess: "Failed to process images. Please try again.",
    analyzingImages: "Analyzing Images...",
    pleaseWait: "Please wait while we analyze your images",
    selectCrop: "Select Crop Type",
    cropRequired: "Please select a crop type before uploading images.",
    selectCropPlaceholder: "Tap to select crop",
  });

  useEffect(() => {
    // Fetch crop list
    fetchCropList();
    
    (async () => {
      setUi({
        back: await translate("Back"),
        title: await translate("Upload Crop Images"),
        subtitle: await translate(`Max ${MAX_IMAGES} images`),
        uploadButton: await translate("+ Camera or Gallery"),
        processing: await translate("Processing..."),
        submit: await translate("Submit"),
        permissionDenied: await translate("Permission denied"),
        allowPhotos: await translate("Please allow access to your photos."),
        allowCamera: await translate("Please allow access to your camera."),
        limitReached: await translate("Limit reached"),
        maxImagesMsg: await translate(`You can upload a maximum of ${MAX_IMAGES} images.`),
        uploadImage: await translate("Upload Image"),
        chooseSource: await translate("Choose a source"),
        camera: await translate("Camera"),
        gallery: await translate("Gallery"),
        cancel: await translate("Cancel"),
        noImageSelected: await translate("No image selected"),
        uploadAtLeastOne: await translate("Please upload at least one image."),
        error: await translate("Error"),
        failedToProcess: await translate("Failed to process images. Please try again."),
        analyzingImages: await translate("Analyzing Images..."),
        pleaseWait: await translate("Please wait while we analyze your images"),
        selectCrop: await translate("Select Crop Type"),
        cropRequired: await translate("Please select a crop type before uploading images."),
        selectCropPlaceholder: await translate("Tap to select crop"),
      });
    })();
  }, [translate]);

  const fetchCropList = async () => {
    try {
      const crops: CropItem[] = [
        { "name": "Apple", "symbol": "🍎" },
        { "name": "Bean", "symbol": "🫘" },
        { "name": "Bell Pepper", "symbol": "🫑" },
        { "name": "Cherry", "symbol": "🍒" },
        { "name": "Chilli", "symbol": "🌶️" },
        { "name": "Corn", "symbol": "🌽" },
        { "name": "Maize", "symbol": "🌽" },
        { "name": "Cotton", "symbol": "🌿" },
        { "name": "Cucumber", "symbol": "🥒" },
        { "name": "Grape", "symbol": "🍇" },
        { "name": "Groundnut", "symbol": "🥜" },
        { "name": "Guava", "symbol": "🍐" },
        { "name": "Lemon", "symbol": "🍋" },
        { "name": "Peach", "symbol": "🍑" },
        { "name": "Potato", "symbol": "🥔" },
        { "name": "Pumpkin", "symbol": "🎃" },
        { "name": "Rice", "symbol": "🍚" },
        { "name": "Strawberry", "symbol": "🍓" },
        { "name": "Sugarcane", "symbol": "🌾" },
        { "name": "Tomato", "symbol": "🍅" },
        { "name": "Wheat", "symbol": "🌾" },
        { "name": "Miscellaneous", "symbol": "🧩" }
      ];
      const translatedCrops = await Promise.all(
        crops.map(async (crop) => ({
          ...crop,
          label: await translate(crop.name),
        }))
      );
      setCropList(translatedCrops);
    } catch (error) {
      console.error('Error fetching crop list:', error);
    }
  };

  const pickFromGallery = async () => {
    if (!selectedCrop) {
      Alert.alert(ui.selectCrop, ui.cropRequired);
      return;
    }
    
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(ui.permissionDenied, ui.allowPhotos);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: Math.max(0, MAX_IMAGES - images.length),
        quality: 1,
      });

      if (!result.canceled) {
        const selected = result.assets.map((a) => ({ uri: a.uri }));
        setImages((prev) => [...prev, ...selected].slice(0, MAX_IMAGES));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const pickFromCamera = async () => {
    if (!selectedCrop) {
      Alert.alert(ui.selectCrop, ui.cropRequired);
      return;
    }
    
    try {
      if (images.length >= MAX_IMAGES) {
        Alert.alert(ui.limitReached, ui.maxImagesMsg);
        return;
      }
      const camPerm = await ImagePicker.requestCameraPermissionsAsync();
      if (!camPerm.granted) {
        Alert.alert(ui.permissionDenied, ui.allowCamera);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 1,
      });
      if (!result.canceled && result.assets?.length) {
        const photo = { uri: result.assets[0].uri };
        setImages((prev) => [...prev, photo].slice(0, MAX_IMAGES));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectImages = async () => {
    if (!selectedCrop) {
      Alert.alert(ui.selectCrop, ui.cropRequired);
      return;
    }
    
    Alert.alert(ui.uploadImage, ui.chooseSource, [
      { text: ui.camera, onPress: pickFromCamera },
      { text: ui.gallery, onPress: pickFromGallery },
      { text: ui.cancel, style: "cancel" },
    ]);
  };

  const handleRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedCrop) {
      Alert.alert(ui.selectCrop, ui.cropRequired);
      return;
    }
    
    if (images.length === 0) {
      Alert.alert(ui.noImageSelected, ui.uploadAtLeastOne);
      return;
    }

    setLoading(true);
    try {
      const userEmail = await AsyncStorage.getItem('userEmail');
      const apiUris = images.map((i) => i.uri);
      const apiResult = await predictDiseaseWithImages({ 
        uris: apiUris, 
        user_id: userEmail,
        selected_crop: selectedCrop 
      });

      const perImage = apiResult?.per_image || [];
      const predictions = perImage.map((p: any, idx: number) => ({ imageIndex: idx + 1, ...p }));
      predictions.push({ 
        imageIndex: 0, 
        ensemble: true, 
        prediction: apiResult.prediction, 
        confidence: apiResult.confidence, 
        score: apiResult.confidence_score, 
        details: apiResult.details 
      });

      const resultEntry = {
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        imageCount: images.length,
        images: images,
        predictions: predictions,
        serverResult: apiResult,
        type: 'crop-upload'
      };

      const key = `history_${userEmail}`;
      const existingData = await AsyncStorage.getItem(key);
      const history = existingData ? JSON.parse(existingData) : [];
      history.push(resultEntry);
      await AsyncStorage.setItem(key, JSON.stringify(history));

      router.push({
        pathname: "/result",
        params: { 
          images: JSON.stringify(images), 
          predictions: JSON.stringify(predictions),
          resultId: resultEntry.id,
          serverResult: JSON.stringify(apiResult)
        }
      } as any);
    } catch (error) {
      console.error('Error processing images:', error);
      Alert.alert(ui.error, ui.failedToProcess);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title={ui.title} subtitle={ui.subtitle}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#1b5e20" />
        <Text style={styles.backText}>{ui.back}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{ui.title}</Text>

      {/* Crop Selection Section */}
      <View style={styles.cropSelectionContainer}>
        <Text style={styles.cropLabel}>
          {ui.selectCrop} <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity 
          style={[styles.cropSelector, !selectedCrop && styles.cropSelectorEmpty]}
          onPress={() => setShowCropPicker(!showCropPicker)}
          disabled={loading}
        >
          <Text style={[styles.cropSelectorText, !selectedCrop && styles.cropSelectorTextEmpty]}>
            {selectedCrop ? `${cropList.find(c => c.name === selectedCrop)?.symbol || ''} ${cropList.find(c => c.name === selectedCrop)?.label || selectedCrop}` : ui.selectCropPlaceholder}
          </Text>
          <Text style={styles.cropSelectorArrow}>{showCropPicker ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        
        {showCropPicker && (
          <ScrollView style={styles.cropPickerDropdown} nestedScrollEnabled>
            {cropList.map((crop) => (
              <TouchableOpacity
                key={crop.name}
                style={[
                  styles.cropOption,
                  selectedCrop === crop.name && styles.cropOptionSelected
                ]}
                onPress={() => {
                  setSelectedCrop(crop.name);
                  setShowCropPicker(false);
                }}
              >
                <Text style={styles.cropOptionText}>
                  {crop.symbol} {crop.label || crop.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <TouchableOpacity
        style={[styles.uploadLabel, (images.length >= MAX_IMAGES || !selectedCrop) && { opacity: 0.5 }]}
        onPress={handleSelectImages}
        disabled={images.length >= MAX_IMAGES || loading || !selectedCrop}
      >
        <Text style={styles.uploadText}>{ui.uploadButton}</Text>
      </TouchableOpacity>

      {images.length > 0 && (
        <View style={styles.previewRow}>
          {images.map((img, idx) => (
            <View key={idx} style={styles.previewImgBox}>
              <Image source={{ uri: img.uri }} style={styles.previewImg} />
              <TouchableOpacity 
                style={styles.removeBtn} 
                onPress={() => handleRemove(idx)}
                disabled={loading}
              >
                <Text style={styles.removeText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <Button 
        title={loading ? ui.processing : ui.submit} 
        onPress={handleSubmit} 
        disabled={images.length === 0 || loading || !selectedCrop} 
        style={{ marginTop: 18 }} 
      />
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B9E4A" />
          <Text style={styles.loadingText}>{ui.analyzingImages}</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#4A6B3A",
    marginBottom: 20,
    textAlign: "center",
  },
  cropSelectionContainer: {
    width: 320,
    marginBottom: 24,
  },
  cropLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A6B3A",
    marginBottom: 8,
  },
  required: {
    color: "#D32F2F",
    fontSize: 18,
  },
  cropSelector: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#6B9E4A",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cropSelectorEmpty: {
    borderColor: "#BBDEFB",
    borderStyle: "dashed",
  },
  cropSelectorText: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "500",
  },
  cropSelectorTextEmpty: {
    color: "#999999",
  },
  cropSelectorArrow: {
    fontSize: 14,
    color: "#6B9E4A",
  },
  cropPickerDropdown: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E8ED",
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  cropOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  cropOptionSelected: {
    backgroundColor: "#E8F5E9",
  },
  cropOptionText: {
    fontSize: 16,
    color: "#333333",
  },
  uploadLabel: {
    backgroundColor: "#F8FAFB",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#BBDEFB",
    borderRadius: 16,
    paddingVertical: 36,
    paddingHorizontal: 20,
    width: 320,
    alignItems: "center",
    marginBottom: 28,
  },
  uploadText: {
    color: "#6B9E4A",
    fontWeight: "700",
    fontSize: 16,
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  previewImgBox: {
    position: "relative",
    width: 110,
    height: 110,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E1E8ED",
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
  },
  previewImg: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
  },
  removeBtn: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#D32F2F",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: '#B71C1C',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  removeText: { 
    color: "#FFFFFF", 
    fontSize: 18, 
    fontWeight: "700", 
    lineHeight: 20 
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B9E4A',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 16,
    color: '#1b5e20',
    fontWeight: '600',
  },
});
