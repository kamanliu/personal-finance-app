import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccounts } from '../context/AccountContext';
import { useFilteredTransactions } from '../hook/useFilteredTransactions';

export default function TransactionList() {


    const { accounts, deleteTrans, getAccountById, currentDate, changeMonth, updateTransaction } = useAccounts()
    const { accountId } = useLocalSearchParams();

    const selectedAccount = getAccountById(accountId);
    // console.log("the issue is here!");
    // console.log(selectedAccount)
    const { displayTransactions, deposit: deposit, withdrawl: withdrawl, total } = useFilteredTransactions(selectedAccount?.transactions || [], accountId as string);
    const router = useRouter();


    return (
        <SafeAreaView>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => changeMonth(-1)}>
                    <Text>{" < "}</Text>
                </TouchableOpacity>
                <Text>{currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}</Text>
                <TouchableOpacity onPress={() => changeMonth(1)}>
                    <Text>{" > "}</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.header}>
                <Text style={styles.header_text}>Deposit</Text>
                <Text style={styles.header_text}>Withdrawl</Text>
                <Text style={styles.header_text}>Total</Text>
            </View>
            <View style={styles.header}>
                <Text style={styles.header_text}>${deposit.toLocaleString()}</Text>
                <Text style={styles.header_text}>${withdrawl.toLocaleString()}</Text>
                <Text style={styles.header_text}>${total.toLocaleString()}</Text>
            </View>
            <FlatList
                data={displayTransactions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (

                    <View>
                        <TouchableOpacity onPress={() => router.push({pathname: '/AddTransaction', params: {transId: item.id}})} >
                        {item.type !== "Transfer" ? (
                            
                                <Text>{`${(item.date)?.split('T')[0]} • ${item.type}  • ${item.amount} • ${item.category || 'N/A'} • ${getAccountById(item.account_id)?.name || 'Unknown'}`}</Text>
                            
                        ) : (
                            
                                <Text> {`${(item.date)?.split('T')[0]}• ${item.type}  • ${item.amount} • ${getAccountById(item.account_id)?.name || 'Unknown'} -> ${getAccountById(item.to_account_id || undefined)?.name} `}</Text>
                         
                        )}</TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteTrans(item.id)}>
                            <Text>delete</Text>
                        </TouchableOpacity>

                    </View>
                )

                } />
                  <TouchableOpacity  onPress={() => router.back()}>
                           <Text >Go Back</Text>
                         </TouchableOpacity>
        </SafeAreaView>
    )

}

const styles = StyleSheet.create({

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5, // 4. Space out the text and the "+" button from the edges.
        borderBottomWidth: 1,
        borderBottomColor: '#eee',

    },
    header_text: {
        fontSize: 16,
        textAlign: 'center',
        padding: 10,
        flex: 1,
    }
})
