import React, {Component} from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  Platform,
  Alert,
} from 'react-native';
import RNTextDetector from 'react-native-text-detector';
import {RNCamera} from 'react-native-camera';

class App extends React.Component {
  static navigationOptions = {
    headerShown: false,
  };
  state = {
    text: '',
    showText: false,
    canDetectText: true,
    textBlocks: [],
  };
  constructor(props) {
    super(props);
  }

  detectText = async () => {
    try {
      const options = {
        quality: 0.8,
        base64: true,
        skipProcessing: true,
      };
      // Camera won't work on simulator so following 2 lines are in comment, If you are using device them use URI from camera
      // const {uri} = await this.camera.takePictureAsync(options);
      // console.log('uri_of_image', uri);
      const visionResp = await RNTextDetector.detectFromUri(
        'file:///Users/mac/Downloads/Screenshot%202020-07-22%20at%2010.11.35%20AM.png',
      );
      console.log('visionResp', visionResp);
      this.getTotal(visionResp);
      this.setState({
        text: visionResp,
        showText: true,
      });
    } catch (e) {
      console.warn(e);
    }
  };

  detectTextAndroid = async () => {
    try {
      const options = {
        quality: 0.8,
        base64: true,
        skipProcessing: true,
      };
      const {uri} = await this.camera.takePictureAsync(options);
      console.log('uri_of_image', uri);
      const visionResp = await RNTextDetector.detectFromUri(uri);
      console.log('visionResp', visionResp);
      this.getTotal(visionResp);
      this.setState({
        text: visionResp,
        showText: true,
      });
    } catch (e) {
      console.warn(e);
    }
  };

  getTotal(visionResp) {
    var total_index = -1;
    visionResp.find((itemss, index) => {
      if (
        itemss.text.toLowerCase() === 'total' ||
        itemss.text.toLowerCase() === 'total:' ||
        itemss.text.toLowerCase().includes('total')
      ) {
        console.log('index', index);
        total_index = index + 1;
      }
      if (index === total_index) {
        if (isNaN(itemss.text)) {
          //Alert.alert('Value is Not Number');
          total_index = total_index + 1;
        } else {
          //Alert.alert('Value is Number');
          Alert.alert('Total is : ', itemss.text);
        }
      }
      // if (index === total_index) {
      //   Alert.alert('Total is : ', itemss.text);
      // }
    });
  }

  renderTextBlocks = () => (
    <View style={styles.textBlock_container} pointerEvents="none">
      {this.state.textBlocks.map(this.renderTextBlock)}
    </View>
  );

  renderTextBlock = ({bounds, value}) => (
    <React.Fragment key={value + bounds.origin.x}>
      <Text
        style={[
          styles.textBlock,
          {left: bounds.origin.x, top: bounds.origin.y},
        ]}>
        {value}
      </Text>
      <View
        style={[
          styles.text,
          {
            ...bounds.size,
            left: bounds.origin.x,
            top: bounds.origin.y,
          },
        ]}
      />
    </React.Fragment>
  );

  textRecognized = (object) => {
    const {textBlocks} = object;
    this.setState({textBlocks});
  };

  render() {
    const {canDetectText} = this.state;
    if (this.state.showText) {
      return (
        <FlatList
          style={styles.text_list}
          data={this.state.text}
          keyExtractor={(item) => item.text}
          renderItem={({item}) => this.renderItem(item)}
        />
      );
    } else {
      if (Platform.OS === 'ios') {
        return (
          <View style={styles.text_list_ios}>
            <Button title={'Click Me'} onPress={() => this.detectText()} />
          </View>
        );
      } else {
        return (
          <RNCamera
            ref={(ref) => {
              this.camera = ref;
            }}
            onTextRecognized={canDetectText ? this.textRecognized : null}
            style={styles.camera_style}>
            <Text style={styles.button_margin} />
            <Button
              title={'Click Me'}
              onPress={() => this.detectTextAndroid()}
            />
            {!!canDetectText && this.renderTextBlocks()}
          </RNCamera>
        );
      }
    }
  }
  renderItem(item) {
    return <Text>{item.text}</Text>;
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: '#000',
  },
  flipButton: {
    flex: 0.3,
    height: 40,
    marginHorizontal: 2,
    marginBottom: 10,
    marginTop: 10,
    borderRadius: 8,
    borderColor: 'white',
    borderWidth: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoFocusBox: {
    position: 'absolute',
    height: 64,
    width: 64,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
    opacity: 0.4,
  },
  flipText: {
    color: 'white',
    fontSize: 15,
  },
  zoomText: {
    position: 'absolute',
    bottom: 70,
    zIndex: 2,
    left: 2,
  },
  picButton: {
    backgroundColor: 'darkseagreen',
  },
  facesContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
  },
  face: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 2,
    position: 'absolute',
    borderColor: '#FFD700',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  faceText: {
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
    backgroundColor: 'transparent',
  },
  text: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 2,
    position: 'absolute',
    borderColor: '#F00',
    justifyContent: 'center',
  },
  textBlock: {
    color: '#F00',
    position: 'absolute',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  textBlock_container: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
  },
  text_list: {
    marginTop: Platform.OS === 'ios' ? 50 : 0,
    marginBottom: Platform.OS === 'ios' ? 50 : 0,
  },
  text_list_ios: {
    backgroundColor: 'black',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera_style: {
    flex: 1,
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'ios' ? 50 : 0,
    marginBottom: Platform.OS === 'ios' ? 50 : 0,
  },
  button_margin: {
    marginBottom: 20,
  },
});
export default App;
