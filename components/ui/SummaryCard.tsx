

import { formatCurrency } from '@/utils/formatCurrency';
import { StyleSheet, Text, View } from 'react-native';
import { IconCircle, iconSets } from '../../utils/IconCircle';





type SummaryCardProps = {
    text1: string;
    text1color?: string;
    text2: string;
    text2color?: string;
    text3: string;
    text3color?: string;
    amount1: number;
    amount2: number;
    amount3: number;
    iconSet?: keyof typeof iconSets;
    icon1?: string;
    icon2?: string;
    icon3?: string;
};
export function SummaryCard({ text1, text1color, text2, text2color, text3, text3color, amount1, amount2, amount3, icon1, icon2, icon3, iconSet }: SummaryCardProps) {


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
                <Text style={[{ color: "#10b981" }, styles.textStyle]}    numberOfLines={1}
    adjustsFontSizeToFit
    minimumFontScale={0.7}>{formatCurrency(amount1)}</Text>
            </View>
            <View style={styles.card}>
                <View style={styles.headerStyle}>
                    {icon2 && <IconCircle
                        categoryType={icon2}
                        iconSize={16}
                    />}

                    <Text style={styles.cardHeader}>{text2}</Text>
                </View>
                <Text style={[{ color: text2color ? text2color : "#ef4444" }, styles.textStyle]}    numberOfLines={1}
    adjustsFontSizeToFit
    minimumFontScale={0.7}>{formatCurrency(amount2)}</Text>
            </View>
            <View style={styles.card}>
                <View style={styles.headerStyle}>

                    {icon3 && <IconCircle
                        categoryType={icon3}
                        iconSize={16}
                    />}
                    <Text style={styles.cardHeader}>{text3}</Text>
                </View>
                <Text style={[{ color: text3color ? text3color : (amount3 >= 0 ? "#1a56db" : "#ef4444") }, styles.textStyle]} numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}>{formatCurrency(amount3)}</Text>
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
        minHeight: 90,  // add this — locks card height regardless of wrap
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
        fontSize: 14,  // down from 15
        fontWeight: 'bold',
        letterSpacing: 0.3,
    }


})