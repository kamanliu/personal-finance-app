import { GoBack } from '@/components/ui/GoBackButton';
import { MonthNavigator } from '@/components/ui/MonthNavigator';
import Transaction from '@/components/ui/Transaction';
import { formatDate } from '@/utils/formatDate';
import { IconCircle } from '@/utils/IconCircle';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccounts } from '../context/AccountContext';
import { useFilteredTransactions } from '../hook/useFilteredTransactions';


export default function TransactionList() {


    const { accounts, getAccountById, currentDate, changeMonth, updateTransaction, getAccountByPlaidId, isSyncing, syncStatus } = useAccounts()
    const { accountId } = useLocalSearchParams();

    const selectedAccount = getAccountById(accountId);
    // console.log("the issue is here!");
    // console.log(selectedAccount)
    const { displayTransactions, deposit: deposit, withdrawl: withdrawl, total } = useFilteredTransactions(selectedAccount?.transactions || [], accountId as string, selectedAccount?.account_id ?? undefined);

    const router = useRouter();
    const groupBytype = displayTransactions.reduce((trans, item) => {
        if (!trans[item.date]) {
            trans[item.date] = [];
        }

        trans[item.date].push(item);
        return trans
    }, {}
    )



    const displayOrder = Object.keys(groupBytype);
    const sections = displayOrder.map(date => ({
        title: date,
        data: groupBytype[date]
    }));


    return (
        <SafeAreaView>
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
            {sections.length > 0 &&
                <View style={styles.transactionCard}>
                    <SectionList
                        sections={sections}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View >
                                {item.type !== "Transfer" ? (
                                    <Transaction
                                        label={item.note}
                                        value={item.amount}
                                        date={item.date}
                                        type={item.type}
                                        category={item.category}
                                        income={item.type === 'Income'}

                                        onPress={item.source !== 'plaid' ? () => router.push({ pathname: '/AddTransaction', params: { transId: item.id } }) : undefined}

                                    />
                                ) : (

                                    <Transaction
                                        label={`${item.source === 'plaid' ?
                                            getAccountByPlaidId(item.account_id)?.name
                                            : getAccountById(item.account_id)?.name
                                            || 'Unknown'} ➪ ${item.source === 'plaid'
                                                ? getAccountByPlaidId(item.to_account_id || '')?.name
                                                : getAccountById(item.to_account_id || undefined)?.name
                                            }`}
                                        value={item.amount}
                                        date={item.date}
                                        type={item.type}
                                        category={item.category}
                                        income={item.type === 'Income'}
                                        onPress={item.source !== 'plaid' ? () => router.push({ pathname: '/AddTransaction', params: { transId: item.id } }) : undefined}


                                    />

                                )}
                            </View>
                        )}
                        renderSectionHeader={({ section }) => (
                            <View style={{ backgroundColor: '#fff', paddingLeft: 10, borderRadius: 20 }}>
                                <Text style={{ marginTop: 10, marginLeft: 5 }}>{formatDate(section.title)}</Text>
                            </View>
                        )} />
                </View>}

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
            {sections.length === 0 && (
                <View style={{ alignItems: 'center', marginTop: 50 }}>
                    <Text style={{ fontSize: 16, color: '#6b7280' }}>No transactions found for this month.</Text>
                </View>
            )

            }

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

})
