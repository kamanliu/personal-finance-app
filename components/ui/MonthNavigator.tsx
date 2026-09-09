import { Entypo } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';



type MonthNavigatorProps = {
    date: string;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    income: number;
    expense: number;
    total: number;
    showSummary?: boolean;

};
export function MonthNavigator({ date, onPrevMonth, onNextMonth, income, expense, total, showSummary }: MonthNavigatorProps) {
    const monthYear = new Date(date).toLocaleDateString('default', { month: 'long', year: 'numeric' })
    const textColor = total >= 0 ? "#10b981" : "#ef4444";


    return (
        <View style={{ alignItems: 'center' }}>
            <View style={[styles.header, { paddingHorizontal: 50 }]}>
                <TouchableOpacity onPress={onPrevMonth}>
                    <Entypo name="chevron-left" size={20} color="#6e6f6e" /></TouchableOpacity>

                <Text style={{ color: "#6e6f6e", fontWeight: 'bold' }} >{monthYear}</Text>
                <TouchableOpacity onPress={onNextMonth}>
                    <Entypo name="chevron-right" size={20} color="#6e6f6e" />
                </TouchableOpacity>


            </View >
            {showSummary &&
                <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={styles.card}>
                        <Text style={styles.cardHeader}>Income</Text>
                        <Text style={{ color: "#10b981", fontSize: 17, fontWeight: 'bold', }}>${income.toLocaleString()}</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.cardHeader}>Expense</Text>
                        <Text style={{ color: "#ef4444", fontSize: 17, fontWeight: 'bold', }}>${expense.toLocaleString()}</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.cardHeader}>Balance</Text>
                        <Text style={{ color: textColor, fontSize: 17, fontWeight: 'bold', }}>${total.toLocaleString()}</Text>
                    </View>
                </View>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        borderRadius: 20,
        backgroundColor: "white",
        width: "95%",
        marginTop: -1

    },
    header_text: {
        fontSize: 16,
        textAlign: 'center',
        alignItems: 'center',
        flex: 1,
    },
    card: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 10,
        margin: 5,
        marginTop: 0,
        width: "31.5%"

    },
    cardHeader: {
        color: "#5c5d5c",
        paddingBottom: 7
    }



})