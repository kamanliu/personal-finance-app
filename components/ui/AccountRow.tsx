import { formatCurrency } from '@/utils/formatCurrency';
import { IconCircle } from '@/utils/IconCircle';
import { IconSquare } from '@/utils/IconSquare';
import { Feather, FontAwesome6, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const iconSets = {
    ionicons: Ionicons,
    feather: Feather,
    materialCI: MaterialCommunityIcons,
    fontawesome: FontAwesome6,
    material: MaterialIcons

};

type AccountRowProps = {

    name: string;
    balance: number;
    onDelete: () => void;
    onPress: () => void;
    accountType?: string;
    isEditing?: boolean;
    color?: string;

};


export function AccountRow({ name, balance, onDelete, onPress, accountType, isEditing, color }: AccountRowProps) {
  const categoryIcon: Record<string, { iconColor: string }> = {
        "depository": { iconColor: "#f89634" },
        "card": { iconColor: color ? color : "#2561fa" },
        
    }
    const matched = categoryIcon[accountType?.toLocaleLowerCase() || ''] || { iconColor: color || "#5cd7f6" }

    return (

        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
            {isEditing === true && (
                <TouchableOpacity onPress={() => onDelete()}>
                    <IconCircle
                        icon='remove-circle'
                        iconSet='ionicons'
                        iconSize={20}
                        iconColor='red'
                        onButton={() => onDelete()}

                    />
                </TouchableOpacity>)}

            <TouchableOpacity  style={[styles.card, { borderColor: matched.iconColor||color }]} onPress={onPress} >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>

                    <IconSquare
                        icon={name.charAt(0)}
                        iconSize={16}
                        accountType={accountType}
                        iconColor={matched.iconColor||color}
                    />

                    <Text style={styles.textStyle}>
                        {name}
                    </Text>
                </View>
                <Text style={[styles.textStyle, { color: balance >0 ?"#1a56db" :( balance<0? "#ef4444":'black'), fontSize: 15, }]}>
                    {formatCurrency(balance)}</Text>
                <IconCircle
                    icon='more'
                    iconSize={20}
                    iconColor='grey'
                    iconSet='antDesign'
                />

            </TouchableOpacity>

        </View>

    )

}

const styles = StyleSheet.create({
    textStyle: {
        fontSize: 13,
        padding: 10,
        paddingRight: 5,
        flexShrink: 1,
        fontWeight: 'bold',



    },

    card: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 18,
        borderLeftWidth: 3.5,
        paddingVertical: 14,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        

    }

})

