import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconCircle, iconSets } from '../../utils/IconCircle';


type ButtonCardProps = {

  onSelect?: () => void;
  disabled?: boolean;
  iconSet: keyof typeof iconSets;
  icon?: string;
  iconColor?: string;
  text1: string;
  text2?: string;
  text3?: string;
  insideButton?: () => void;
  insideButtonText?: string;
  insideIconSet?: keyof typeof iconSets;
  insideIcon?: string;
}

export function ButtonCard({ onSelect, text1, text2, text3, icon, iconColor, iconSet, disabled, insideButton, insideButtonText, insideIcon, insideIconSet }: ButtonCardProps) {
  const Wrapper = onSelect ? TouchableOpacity : View;    
  const InsideIcon = insideIconSet ? iconSets[insideIconSet] : undefined;
  return (

    <View >
      <Wrapper style={styles.card} onPress={(onSelect)}>
        <View style={{ flexDirection: 'row' }}>
          {icon && iconSet && (
            <IconCircle icon={icon} iconSet={iconSet} iconColor={iconColor} iconSize={22} />
          )}
          <View style={{ flexDirection: 'column', paddingLeft: 8 }}>
            <Text>{text1}</Text>
            <Text style={{ color: '#6b7280', paddingTop: 5 }}>{text2}</Text>

          </View>
        </View>

        <Text style={{ fontSize: 20 }}>{text3}</Text>
      </Wrapper >
      {insideButton && (
        <TouchableOpacity
          onPress={insideButton}
          style={styles.insideButtonStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {InsideIcon && <InsideIcon name={insideIcon as any} size={18} color="#ef4444" />}
            <Text style={{ color: "#ef4444", marginLeft: 6 }}>{insideButtonText}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View >



  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 10,
    paddingLeft: 15,
    paddingRight: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerText: {
    color: '#5a5959',
    padding: 10,
    paddingLeft: 15,
    fontSize: 13
  },

  iconStyle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  insideButtonStyle: {
    padding: 10,
    backgroundColor: "#ef444412",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#ef444430",
    alignItems: 'center',
    margin: 18,
    marginTop: 5


  }
})