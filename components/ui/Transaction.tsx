import { formatCategory } from '@/utils/formatCategory';
import { formatCurrency } from '@/utils/formatCurrency';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconCircle } from '../../utils/IconCircle';



type TransactionProps = {
    label: string;
    value: number;
    date: string;
    type: string;
    category: string;
    income: boolean;
    onPress?: () => void;
};



export default function Transaction({ label, value, date, type, category, income, onPress }: TransactionProps) {

    
    const formatWord = formatCategory(category)
    const Wrapper = onPress ? TouchableOpacity : View;

    return (

        <Wrapper onPress={onPress} >
            <View style={styles.trans}>
                    <IconCircle
                                   categoryType={formatWord}
                                   iconSize={22}
                               />
               
                <View style={{ flexDirection: 'column', marginLeft: 10, flex: 1 }}>
                    <Text style={styles.textStyle}>{label}</Text>
                    <Text style={{ color: '#6b7280' }}>{`${formatWord}`}</Text>

                </View>
                <Text style={[styles.amountStyle, { color: income ? "#10b981" : "black", }]}>{income ? '+' : ''} {formatCurrency(value)}</Text>

            </View>
        </Wrapper>
    )

}

const styles = StyleSheet.create({
    textStyle: {
        fontWeight: 'bold',
        fontSize: 15,
        paddingBottom: 5
    },
    amountStyle: {

        paddingBottom: 5,
        
        fontSize: 15, 
        fontWeight: 'bold',
        

    },
    trans: {
        backgroundColor: "white",
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20
    }

})

