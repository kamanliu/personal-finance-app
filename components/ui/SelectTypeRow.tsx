
import { IconCircle, iconSets } from '@/utils/IconCircle';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';


type SelectTypeRowProps = {
    transType: any[];
    currentType: string | null;
    onSelectType: (type: string) => void;
    onSelectCategory?: (category: string | null) => void;
    icon?:boolean;
    background?: string;
    style?: object;

};


export function SelectTypeRow({ transType, currentType, onSelectType, onSelectCategory,icon, background, style }: SelectTypeRowProps) {
    const TransType: Record<string, { icon: string, color: string, iconSet: keyof typeof iconSets }> = {
        "income": { icon: "arrow-up-right", color: "#10b981", iconSet: 'feather', },
        "expense": { icon: "arrow-down-left", color: "#ef4444", iconSet: 'feather' },
        "transfer": { icon: "exchange", color: '#f59e0b', iconSet: 'fontawesome' },
        "budget": { icon: "stats-chart", color: '#8b5cf6', iconSet: 'ionicons' }
    }
    const matched = TransType[currentType?.toLocaleLowerCase() || ''] || { icon: 'help', color: '#797979', iconSet: 'feather' }
    return (
        <View style={[styles.card, { backgroundColor: background ? background : "#f2f3f7" }, style]}>
            {
                transType.map((type) => {
                    const matched = TransType[type.toLocaleLowerCase()] || { icon: 'help', color: '#797979', iconSet: 'feather' };
                    return (
                        <TouchableOpacity
                            key={type}
                            onPress={() => { onSelectType(type) }}
                            style={[
                                styles.button,
                                currentType === type && styles.activeTabButton,
                                style

                            ]}
                        >
                            {icon&&
                            <IconCircle
                                icon={matched.icon}
                                iconSet={matched.iconSet}
                                iconColor={currentType === type ? matched.color : '#676666'}
                                iconSize={16}
                                noBackground
                            />}
                            <Text style={{ fontSize: 15, color: currentType === type ? matched.color : '#676666' }}>{type}</Text>
                        </TouchableOpacity>
                    );
                })
            }
        </View>
    )
}
const styles = StyleSheet.create({

    activeTabButton: {
        backgroundColor: 'white',
        fontWeight: 'bold',

    },
    card: {

        flexDirection: 'row',
        margin: 10,
        justifyContent: 'space-between',
        borderRadius: 20,
        padding: 10,


    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 10,
        paddingLeft: 5,
        flex: 1,
        flexDirection: 'row',






    }
})