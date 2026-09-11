import { GoBack } from '@/components/ui/GoBackButton';
import { MonthNavigator } from '@/components/ui/MonthNavigator';
import { groupTransactionsByDate } from '@/utils/groupTransactionsByDate';
import { IconCircle } from '@/utils/IconCircle';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TransactionSectionList } from '../components/ui/TransactionSectionList';
import { useAccounts } from '../context/AccountContext';
import { useFilteredTransactions } from '../hook/useFilteredTransactions';




export default function TransactionList() {


    const { accounts, getAccountById, currentDate, changeMonth, updateTransaction, getAccountByPlaidId, isSyncing, syncStatus } = useAccounts()
    const { accountId, category, type } = useLocalSearchParams();

    const selectedAccount = getAccountById(accountId);

    // console.log("the issue is here!");
    // console.log(selectedAccount)

    const allTransactions = accounts.flatMap(acc => acc.transactions || []);
    const sourceTransactions = selectedAccount ? selectedAccount.transactions : allTransactions;
    const { displayTransactions, deposit, withdrawl, total } = useFilteredTransactions(
        sourceTransactions || [],
        {
            accountId: accountId as string | undefined,
            plaidAccountId: selectedAccount?.account_id ?? undefined,
            category: category as string | undefined,
            transType: type as string | undefined,
        }
    );

    const router = useRouter();
    const sections = groupTransactionsByDate(displayTransactions);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.header}>

                <GoBack
                    text="Account"
                    onGoBack={() => router.back()}
                />
                <IconCircle
                    icon='plus'
                    iconSize={20}
                    iconColor='black'
                    iconSet='antDesign'
                    onButton={() => router.push('/AddTransaction')}
                />
            </View>
            <MonthNavigator
                date={currentDate.toISOString()}
                onPrevMonth={() => changeMonth(-1)}
                onNextMonth={() => changeMonth(1)}
                income={deposit}
                expense={withdrawl}
                total={total}
                showSummary
            />

            <TransactionSectionList
                sections={sections}
                getAccountById={getAccountById}
                getAccountByPlaidId={getAccountByPlaidId}
                onPressItem={(item) => item.source !== 'plaid'
                    ? () => router.push({ pathname: '/AddTransaction', params: { transId: item.id } })
                    : undefined}
            />

            {isSyncing && (
                <View style={styles.syncToast}>
                    <ActivityIndicator color="#007AFF" size="small" style={{ marginRight: 8 }} />
                    <Text style={styles.syncText}>
                        {syncStatus === 'processing'
                            ? 'Analyzing bank data...'
                            : 'Connecting to Plaid...'}
                    </Text>
                </View>
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/AddTransaction')}
                activeOpacity={0.85}
            >
                <Feather name="plus" size={26} color="white" />
            </TouchableOpacity>
        </SafeAreaView>
    )

}

const styles = StyleSheet.create({


    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: 10,
        paddingHorizontal: 0, // 4. Space out the text and the "+" button from the edges.
    },
    transactionCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        paddingTop: 5,
        margin: 12,
        marginTop: -5,
        //borderWidth:1,
        borderColor: '#e1e0e0',

    },
    syncToast: {
        flexDirection: 'row',
        backgroundColor: '#F2F2F7',
        padding: 12,
        margin: 8,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    syncText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1C1C1E'
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 30,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#1a56db',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
    },

})
