import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccounts } from '../../context/AccountContext';
import { useFilteredTransactions } from '../../hook/useFilteredTransactions';

export default function Home() {

  const { accounts, getAccountById, changeMonth, currentDate, getAccountByPlaidId } = useAccounts();

  // .flatMap grabs the transactions array from every acocunt and merges them
  const allTransactions = accounts.flatMap(acc => acc.transactions || [])
  const { displayTransactions, deposit: income, withdrawl: expense, total } = useFilteredTransactions(allTransactions);

  return (
    <SafeAreaView>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => changeMonth(-1)}>
          <Text>{" < "}</Text>
        </TouchableOpacity>
        <Text>{currentDate ? currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' }) : 'Loading...'}</Text>
        <TouchableOpacity onPress={() => changeMonth(1)}>
          <Text>{" > "}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.header}>
        <Text style={styles.header_text}>Income</Text>
        <Text style={styles.header_text}>Expense</Text>
        <Text style={styles.header_text}>Total</Text>
      </View>
      <View style={styles.header}>
        <Text style={styles.header_text}>${income.toLocaleString()}</Text>
        <Text style={styles.header_text}>${expense.toLocaleString()}</Text>
        <Text style={styles.header_text}>${total.toLocaleString()}</Text>
      </View>
      <FlatList
        data={displayTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            {item.type !== "Transfer" ? (
              <Text>
                {`${item.date ? item.date.split('T')[0] : 'No Date'} • ${item.type} • ${item.amount} • ${item.category || 'N/A'} • ${item.source === 'plaid'
                    ? getAccountByPlaidId(item.account_id)?.name
                    : getAccountById(item.account_id)?.name
                    || 'Unknown'}`}
              </Text>
            ) : (
              <Text>
                {`${item.date ? item.date.split('T')[0] : 'No Date'} • ${item.type} • ${item.amount} • ${item.source === 'plaid'
                    ? getAccountByPlaidId(item.account_id)?.name
                    : getAccountById(item.account_id)?.name
                    || 'Unknown'} -> ${item.source === 'plaid'
                    ? getAccountByPlaidId(item.to_account_id || '')?.name
                    : getAccountById(item.to_account_id || undefined)?.name
                  }`}
              </Text>
            )}
          </View>

        )
        } />
    </SafeAreaView>

  )

}

const styles = StyleSheet.create({
  content_container: {
    flex: 1,
    backgroundColor: '#fff',
  },
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