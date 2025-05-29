import { PropsWithChildren, useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Text, View, Dimensions, ScrollView, Animated, Image } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface CollapsibleProps {
  title: string;
  keepShut?: boolean;
  image?: any; // Image source
  imageStyle?: any; // Optional custom image style
  titleContainerStyle?: any; // Optional custom style for the title container
  titleTextStyle?: any; // Optional custom style for the title text
  training?: boolean; // Optional prop to show training icon
  setCurrentMode?: any;
  setCurrentPlan?: any;
}

export function Collapsible({
  children,
  title,
  image,
  imageStyle,
  titleContainerStyle,
  titleTextStyle,
  keepShut = false,
  training = false,
  setCurrentMode = () => {},
  setCurrentPlan = () => {}
}: PropsWithChildren & CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const contentHeight = useRef(0);

  useEffect(() => {
    if (isOpen) {
      Animated.timing(animatedHeight, {
        toValue: contentHeight.current,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animatedHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isOpen]);

  const onContentLayout = (event: any) => {
    contentHeight.current = event.nativeEvent.layout.height;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => {
          if (keepShut === false) {
            setIsOpen((value) => !value)
          }
          else {
            setCurrentMode("View");
            setCurrentPlan(undefined);
          }
        }}
        activeOpacity={0.8}>
        <LinearGradient
          colors={[colors.cardBackground, colors.cardBackgroundLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={[styles.titleContainer, titleContainerStyle]}>
            {image && (
              <Image
                source={image}
                style={[styles.titleImage, imageStyle]}
                resizeMode="contain"
              />
            )}
            <Text style={[styles.text, titleTextStyle]}>{title}</Text>
            {training && (
              <View style={{ flex: 1 }}>
                <View style={{ justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                  <Ionicons
                    name = "add-outline"
                    size = {24}
                    color = "white"
                    onPress = {() => {
                      setCurrentMode("Add");
                      setCurrentPlan(undefined);
                    }}
                  />
                </View>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <Animated.View style={[styles.content, { height: animatedHeight }]}>
        <View style={styles.contentInner} onLayout={onContentLayout}>
          <LinearGradient
            colors={[colors.cardBackground, colors.cardBackgroundLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <ScrollView>
              {children}
            </ScrollView>
          </LinearGradient>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  heading: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 8,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.borderColor,
    overflow: 'hidden',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
  },
  titleImage: {
    width: 24,
    height: 24,
  },
  content: {
    width: '100%',
    overflow: 'hidden',
  },
  contentInner: {
    width: '100%',
  },
  gradient: {
    width: '100%',
    padding: 16,
    minHeight: 50,
  },
  text: {
    fontSize: 25,
    fontWeight: 500,
    color: colors.textPrimary,
  },
});
