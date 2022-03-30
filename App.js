
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Image, Button} from 'react-native';
//import RNFS from "react-native-fs";
import * as tf from '@tensorflow/tfjs'
import * as mobilenet from '@tensorflow-models/mobilenet'
import fetch from '@tensorflow/tfjs-react-native';
import * as jpeg from 'jpeg-js'
import * as FileSystem from 'expo-file-system';

// import { fetch, decodeJpeg } from '@tensorflow/tfjs-react-native';


export default function App() {
  const [url, setUrl] = useState('https://oceana.org/sites/default/files/tiger_shark_0.jpg')
  const [display, setDisplayText] = useState('loading')

  async function getPrediction(url){
      setDisplayText("Loading Tensor Flow")
      await tf.ready()
      //nuerla network 
      setDisplayText("Loading Mobile Net")
      const model = await mobilenet.load()
      setDisplayText("Fetching Image")
      const response = await fetch(url, {}, {isBinary: true})
      setDisplayText("Getting image Buffer")
      const imageData = await response.arrayBuffer()
      setDisplayText("Getting Image Tensor")
      const imageTensor = imageToTensor(imageData)
      setDisplayText("Getting Classification result")
      const prediction =  await model.classify(imageTensor)
      setDisplayText(JSON.stringify(prediction))
  }

  function imageToTensor(rawData){
    //make a matrix
    const {width, height, data} = jpeg.decode(rawData, true)
    const buffer = new Uint8Array(width*height*3)
    let offset =0;
    for (let i=0; i < buffer.length; i+=3){
      buffer[i] = data[offset] //Red
      buffer[i + 1] = data[offset + 1] //g
      buffer[i + 2] = data[offset + 2]
      offset +=4 //skips A
    }
    return tf.tensor3d(buffer, [height, width, 3])
  }

  return (
    <View style={styles.container}>
      <Text>Only works with Jpeg images</Text>

      <TextInput
      style={{ height: 40, width:"90%", borderColor: 'gray', borderWidth: 1}}
      onChangeValueText={text => setUrl(text)}
      value={url}
      />
      <Image style={styles.imageStyle} source={{uri:url}}></Image>
      <Button title="classify Image" onPress={()=>getPrediction(url)}> </Button>
      <Text>{displayText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageStyle:{
    width: 200,
    height: 200
  }
});