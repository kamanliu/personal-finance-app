import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, TouchableOpacity } from 'react-native';

type GoBackProps = {
    text: string;
    onGoBack: () => void;
}

export function GoBack({ text, onGoBack }: GoBackProps) {
    return (

        <TouchableOpacity style={{ flexDirection: 'row',   alignItems: 'center', 
             padding:8, paddingLeft:17,  justifyContent: 'space-around', width:'22%' 
         }} 
        onPress={onGoBack}>
           <MaterialIcons name="arrow-back-ios" size={20} color="black" />
            <Text>{text}</Text>
        </TouchableOpacity>


    )
}