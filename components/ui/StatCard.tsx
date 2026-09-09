import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { IconCircle, iconSets } from '../../utils/IconCircle';



type StatCardProps = {
    label: string;
    value: string;
    iconSet: keyof typeof iconSets;
    icon: string;
    percentage: string;
    isPositive: boolean;
    iconColor?: string;
};

export function StatCard({ label, value, icon, percentage, isPositive, iconSet, iconColor }: StatCardProps) {
    const arrowIconName = isPositive ? "trending-up" : "trending-down";
    const arrowColor = isPositive ? "#10b981" : "#ef4444";


    return (
        <View style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <IconCircle icon={icon} iconSet={iconSet} iconColor={iconColor} iconSize={22} />
                <View style={[styles.trendCard, { backgroundColor: isPositive ? "#10b98120" : "#ef444420", }]}>
                    <MaterialIcons name={arrowIconName} size={15} color={arrowColor} />
                    <Text style={{ color: arrowColor, marginLeft: 4 }}>{percentage}</Text>
                </View>
            </View>
            <Text style={{ marginBottom: 5 }}>{label}</Text>
            <Text style={styles.amountStyle}>{value}</Text>
        </View>
    )
}
const styles = StyleSheet.create({
    textStyle: {
        fontWeight: 'bold',
        fontSize: 25,
    },
    amountStyle: {
           
        fontWeight: 'bold',
        fontSize: 25,
        letterSpacing:0.5
    },
    card: {
        marginBottom: 5,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 15,
        width: '48.5%',
    },
    trendCard: {
        marginTop: -20,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 22,
        paddingHorizontal: 8,
        paddingVertical: 2
    }

})