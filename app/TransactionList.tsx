import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useAccounts } from './context/AccountContext';


export default function TransactionList() {

    const { accounts } = useAccounts()

    return (
    
            <FlatList
                data={accounts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View>
                    {item.transactions.map((trans) => (
                        <View key={trans.id}>
                        <Text >  {`${trans.date} • ${trans.amount} • ${trans.category} • ${trans.account}`}</Text>       
                       </View>
                    ))}
                    </View>
                    )
                
                
                    
                
                
                }/>
   
    )

}

const styles = StyleSheet.create({
    list: {
        flex: 1,
        flexDirection: 'column',
        padding: 10,
    },
})
