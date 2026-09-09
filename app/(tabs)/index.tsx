
import { MonthNavigator } from '@/components/ui/MonthNavigator';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { useRouter } from 'expo-router';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatCard } from '../../components/ui/StatCard';
import Transaction from '../../components/ui/Transaction';
import { useAccounts } from '../../context/AccountContext';
import { useBalanceSummary } from '../../hook/useBalanceSummary';
import { useFilteredTransactions } from '../../hook/useFilteredTransactions';

export default function Home() {

  const { accounts, getAccountById, changeMonth, currentDate, getAccountByPlaidId } = useAccounts();

  // .flatMap grabs the transactions array from every acocunt and merges them
  const allTransactions = accounts.flatMap(acc => acc.transactions || [])
  const { displayTransactions, deposit: income, withdrawl: expense, total } = useFilteredTransactions(allTransactions);
  const balanceSummary = useBalanceSummary();

  const lastMonthDate = new Date(currentDate);
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const thisMonth = useFilteredTransactions(allTransactions);
  const lastMonth = useFilteredTransactions(allTransactions, undefined, undefined, lastMonthDate);
  console.log('currentDate:', currentDate, 'lastMonthDate:', lastMonthDate);

  const netWorthChangePercent = calculateChange(balanceSummary.total, (balanceSummary.total - (lastMonth.deposit - lastMonth.withdrawl)));
  const incomeChangePercent = calculateChange(thisMonth.deposit, lastMonth.deposit);
  const expenseChangePercent = calculateChange(thisMonth.withdrawl, lastMonth.withdrawl);
  const savingsRate = getSavingsRate(thisMonth.deposit, thisMonth.withdrawl);
  const savingsRateChangePercent = getSavingsRate(thisMonth.deposit, thisMonth.withdrawl) - getSavingsRate(lastMonth.deposit, lastMonth.withdrawl);


  function calculateChange(current: number, previous: number) {
    if (previous === 0 || current === 0) {
      return { percentChange: 0, isPositive: true };
    }
    if (previous === 0) {
      return { percentChange: null, isPositive: current >= 0 };
    }
    const percentChange = ((current - previous) / previous) * 100;
    const isPositive = percentChange >= 0;
    return { percentChange, isPositive };

  }

  function getSavingsRate(deposit: number, withdrawl: number) {
    return deposit === 0 ? 0 : (deposit - withdrawl) / deposit;
  }

  console.log('thisMonth income:', thisMonth.deposit, 'lastMonth income:', lastMonth.deposit, 'result:', incomeChangePercent);
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
  const router = useRouter();


  return (
    <SafeAreaView >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 5, padding: 8 }}>
        <StatCard label="Net Worth" value={formatCurrency(balanceSummary.assets)} icon="wallet-outline" iconSet="ionicons" percentage={`${1}%`} isPositive iconColor="#1a56db" />
        <StatCard label="Monthly Income" value={formatCurrency(income)} icon="arrow-up-right" iconSet="feather" percentage={`${(incomeChangePercent.percentChange)?.toFixed(1)}%`} isPositive={incomeChangePercent.isPositive} iconColor="#10b981" />
        <StatCard label="Monthly Expenses" value={formatCurrency(expense)} icon="arrow-down-left" iconSet="feather" percentage={`${(expenseChangePercent.percentChange)?.toFixed(1)}%`} isPositive={expenseChangePercent.isPositive} iconColor="#ef4444" />
        <StatCard label="Saving Rate" value={`${(savingsRate).toFixed(1)}%`} icon="piggy-bank-outline" iconSet="materialCI" percentage={`${(savingsRateChangePercent)?.toFixed(1)}%`} isPositive={savingsRateChangePercent >= 0} iconColor="#8b5cf6" />
      </View>

      <MonthNavigator
        date={currentDate.toISOString()}
        onPrevMonth={() => changeMonth(-1)}
        onNextMonth={() => changeMonth(1)}
        income={income}
        expense={expense}
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
                    onPress={() => router.push({ pathname: '/AddTransaction', params: { transId: item.id } })}

                  />
                ) : (

                  <Transaction
                    label={`${item.source === 'plaid'
                      ? getAccountByPlaidId(item.account_id)?.name
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
                    onPress={() => router.push({ pathname: '/AddTransaction', params: { transId: item.id } })}

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

  transactionCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingTop: 5,
    margin: 12,
    marginTop: -5,
    //borderWidth:1,
    borderColor: '#e1e0e0'


  }

})