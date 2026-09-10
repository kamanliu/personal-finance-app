
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconCircle } from '../../utils/IconCircle';


type SelectAccountTypeRowProps = {

    onSelect?: () => void;
    type: string;
    style?: object;
    textColor?: string;
    note?: string;
    text3?: string;
    children?: React.ReactNode;
    


}

export function SelectAccountTypeRow({ onSelect, type, style, textColor, note, text3, children }: SelectAccountTypeRowProps) {
    const categoryNote: Record<string, { note: string }> = {
        "cash": { note: 'Physical Cash or Wallet' },
        "card": { note: 'Credit or debit card' },
        "account": { note: 'Saving or chequing account' },
        "depository": { note: 'Link bank account' },
    }
    const matched = categoryNote[type?.toLocaleLowerCase()] || { note: note || '' };


    return (
      
        <TouchableOpacity style={[styles.card, style]} onPress={(onSelect)}>
            <View style={{ flexDirection: 'column', flex: 1,  }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between',alignItems:'center',  }}>
                    <View style={{ flexDirection: 'row',alignItems: 'center'}}>

                        <IconCircle
                            categoryType={type}
                            iconSize={22}
                        />

                        <View style={{ flexDirection: 'column', paddingLeft: 8, justifyContent: 'center' }}>
                            <Text style={{ color: textColor }}>{type}</Text>
                            {matched.note && <Text style={{ color: textColor || '#6b7280', paddingTop: 5 }}>{matched.note}</Text>}
                        </View>

                    </View>



                    {textColor ?
                        <View style={{ backgroundColor: 'white', borderRadius: 15, padding: 7 }}>
                            <Text style={{ fontSize: 15, color: '#6b7280' }}>Change</Text></View>
                        : <Text style={{ justifyContent:'center',fontSize: 17, color: '#25282c' }}>{text3 || '⟩'}</Text>}
                </View>
            {children && <View style={{ marginTop: 10 }}>{children}</View>}
            </View>
        </TouchableOpacity >

    )
}

const styles = StyleSheet.create({
    card: {
        padding: 20,
        borderColor: '#e0e0e0a0',
        borderWidth: 1,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        

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


})