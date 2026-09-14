
import { MonthNavigator } from '@/components/ui/MonthNavigator';
import { formatCurrency } from '@/utils/formatCurrency';
import { groupTransactionsByDate } from '@/utils/groupTransactionsByDate';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatCard } from '../../components/ui/StatCard';
import { TransactionSectionList } from '../../components/ui/TransactionSectionList';
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
  const lastMonth = useFilteredTransactions(allTransactions, { targetDate: lastMonthDate });
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
    return deposit === 0 ? 0 : ((deposit - withdrawl) / deposit) * 100;
}

  console.log('thisMonth income:', thisMonth.deposit, 'lastMonth income:', lastMonth.deposit, 'result:', incomeChangePercent);
  const sections = groupTransactionsByDate(displayTransactions);

  const router = useRouter();


  return (
    <SafeAreaView >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 5, padding: 8 }}>
        <StatCard label="Current Net Worth" value={formatCurrency(balanceSummary.assets)} icon="wallet-outline" iconSet="ionicons"  iconColor="#1a56db" />
        <StatCard label="Monthly Income" value={formatCurrency(income)} icon="arrow-up-right" iconSet="feather" percentage={`${(incomeChangePercent.percentChange)?.toFixed(1)}%`} isPositive={incomeChangePercent.isPositive} iconColor="#10b981" />
        <StatCard label="Monthly Expenses" value={formatCurrency(expense)} icon="arrow-down-left" iconSet="feather" percentage={`${(expenseChangePercent.percentChange)?.toFixed(1)}%`} trendUp={expenseChangePercent.isPositive} isPositive={!expenseChangePercent.isPositive} iconColor="#ef4444" />
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
      <TransactionSectionList
        sections={sections}
        getAccountById={getAccountById}
        getAccountByPlaidId={getAccountByPlaidId}
        onPressItem={(item) => () => router.push({ pathname: '/AddTransaction', params: { transId: item.id } })}
      />


    </SafeAreaView>

  )

}

