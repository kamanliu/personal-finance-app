

import { formatCurrency } from '@/utils/formatCurrency';
import { StyleSheet, Text, View } from 'react-native';
import { IconCircle, iconSets } from '../../utils/IconCircle';





type SummaryCardProps = {
    text1: string;
    text2: string;
    text3: string;
    amount1: number;
    amount2: number;
    amount3: number;
    iconSet?: keyof typeof iconSets;
    icon1?: string;
    icon2?: string;
    icon3?: string;
};
export function SummaryCard({ text1, text2, text3, amount1, amount2, amount3, icon1, icon2, icon3, iconSet }: SummaryCardProps) {
    const textColor = amount3 >= 0 ? "#10b981" : "#ef4444";

    return (

        <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={styles.card}>
                <View style={styles.headerStyle}>
                    {icon1 && <IconCircle
                        categoryType={icon1}
                        iconSize={16}

                    />}

                    <Text style={styles.cardHeader}>{text1}</Text>
                </View>
                <Text style={[{ color: "#10b981" }, styles.textStyle]}>{formatCurrency(amount1)}</Text>
            </View>
            <View style={styles.card}>
                <View style={styles.headerStyle}>
                    {icon2 && <IconCircle
                        categoryType={icon2}
                        iconSize={16}
                    />}

                    <Text style={styles.cardHeader}>{text2}</Text>
                </View>
                <Text style={[{ color: "#ef4444" }, styles.textStyle]}>{formatCurrency(amount2)}</Text>
            </View>
            <View style={styles.card}>
                <View style={styles.headerStyle}>

                    {icon3 && <IconCircle
                        categoryType={icon3}
                        iconSize={16}
                    />}
                    <Text style={styles.cardHeader}>{text3}</Text>
                </View>
                <Text style={[{ color: amount3 >= 0 ? "#1a56db" : "#ef4444" }, styles.textStyle]}>{formatCurrency(amount3)}</Text>
            </View>
        </View>

    )
}

const styles = StyleSheet.create({

    card: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-evenly',
        backgroundColor: "white",
        borderRadius: 20,
        padding: 15,
        width: "31.5%",
        gap: 5

    },
    cardHeader: {
        color: "#5c5d5c",
        alignItems: 'flex-start',



    },
    headerStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5

    },
    textStyle: {
        paddingLeft: 3,

        fontSize: 17,
        fontWeight: 'bold',
        letterSpacing: 0.5

    }


})