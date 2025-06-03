import { ButtonGroup, ButtonGroupProps } from '@rneui/themed';
import React from 'react';

export function ButtonGroupWrapper({
  buttons,
  onPress,
  containerStyle,
  buttonStyle,
  selectedButtonStyle,
  textStyle,
  selectedTextStyle,
  ...rest
}: ButtonGroupProps) {
  return (
    <ButtonGroup
      buttons={buttons}
      onPress={onPress}
      containerStyle={containerStyle}
      buttonStyle={buttonStyle}
      selectedButtonStyle={selectedButtonStyle}
      textStyle={textStyle}
      selectedTextStyle={selectedTextStyle}
      {...rest}
    />
  );
} 