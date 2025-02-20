import { View, Alert, StyleSheet, ScrollView, Image } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import RNPickerSelect from "react-native-picker-select";



export default function addProduct() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", price: "", description: "", image:"o", ingredients:[], category:"" });
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");


  const handleChange = (key, value) => {
    if (key == "ingredients"){
        value = value.split(",")
    }
    setForm({ ...form, [key]: value });
  };

// 📌 Pick an image from the gallery
const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  // 📌 Upload the selected image
  const uploadImage = async () => {
    if (!image) {
      Alert.alert("No Image Selected", "Please select an image first.");
      return;
    }

    let formData = new FormData();
    formData.append("file", {
      uri: image,
      name: "upload.jpg",
      type: "image/jpeg",
    });

    try {
      const response = await axios.post("YOUR_SERVER_URL/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("Upload Successful", "Image uploaded successfully!");
      console.log("Server Response:", response.data);
    } catch (error) {
      Alert.alert("Upload Failed", "Something went wrong.");
      console.error("Upload error:", error);
    }
  };
/* const express = require("express");
const multer = require("multer");

const upload = multer({ dest: "uploads/" }); // Save files in "uploads" folder
const app = express();

app.post("/upload", upload.single("file"), (req, res) => {
res.json({ message: "File uploaded successfully", file: req.file });
});

app.listen(3000, () => console.log("Server running on port 3000")); */

  const handleAddItem = () => {
    // Implementar lógica para agregar item
    setForm({ ...form, category: category });
    console.log(form)
    if (!form.name || !form.price || !form.description|| !form.image || !form.ingredients|| !form.category) {
        console.log("Por favor llene todos los campos.");
        return;
      }
    console.log("Form Submitted:", form);
    Alert.alert("Éxito", "Item agregado.");
    router.push('/adminDashboard');
    setForm({ name: "", price: "", description: "", image:"o", ingredients:[], category:""});
    setImage("")
    setCategory(undefined)
  };

  return (
    <ScrollView style={styles.container}>
        
        <View>
            <Button mode="contained" style={styles.addButton} title="Pick an Image" onPress={pickImage}>Sube una imagen</Button>
            {image && <Image source={{ uri: image }} style={{ width: 200, height: 200, marginVertical: 10 }} />}
            {image && <Button title="Upload Image" onPress={uploadImage} />}
        </View>
        
        <View style={styles.content}>
        <TextInput
            label="Nombre del producto"
            mode="outlined" 
            style={styles.input} 
            value={form.name} 
            onChangeText={(text) => handleChange("name", text)} 
        />
        <TextInput
            label="Precio"
            mode="outlined" 
            style={styles.input} 
            placeholder="$"
            value={form.price} 
            onChangeText={(text) => handleChange("price", text)} 
            keyboardType="numeric"
        />
        <TextInput 
            label="Descripción"
            mode="outlined"
            style={styles.input} 
            placeholder="Descripción del producto"
            value={form.description} 
            onChangeText={(text) => handleChange("description", text)} 
            multiline
            numberOfLines={3}
        />

        <TextInput 
            label="Ingredientes (separar por comas ',')"
            mode="outlined"
            style={styles.input} 
            value={form.ingredients} 
            onChangeText={(text) => handleChange("ingredients", text)} 
            multiline
            numberOfLines={3}
        />

        </View>
        <View style={styles.container1}>
        <RNPickerSelect
        onValueChange={(value) => setCategory(value)}
        items={[
          { label: "Comida", value: "Comida" },
          { label: "Bebida", value: "Bebida" },
          { label: "Extra", value: "Extra" },
        ]}
        placeholder={{ label: "Seleccione una categoria", value: undefined }}
        style={pickerSelectStyles}
      />

        </View>

      <Button
        mode="contained"
        onPress={handleAddItem}
        style={styles.addButton}
      >
        Agregar
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container1: {
        flex: 1, 
        justifyContent: "center", 
        padding: 16,

    },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  price: {
    marginVertical: 8,
    color: '#2196F3',
  },
  description: {
    marginVertical: 8,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  ingredients: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  sauces: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    margin: 4,
  },
  quantity: {
    marginVertical: 8,
  },
  notes: {
    marginVertical: 8,
  },
  addButton: {
    margin: 16,
  },
}); 
const pickerSelectStyles = {
    inputIOS: { borderWidth: 1, borderColor: "#ccc", padding: 16, borderRadius: 5, marginTop: 10 },
    inputAndroid: { borderWidth: 1, borderColor: "#ccc", padding: 16, borderRadius: 5, marginTop: 10 },
};