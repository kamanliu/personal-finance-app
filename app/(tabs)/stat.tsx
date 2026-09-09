import { MonthNavigator } from '@/components/ui/MonthNavigator';
import { SelectAccountTypeRow } from '@/components/ui/SelectAccountTypeRow';
import { SelectTypeRow } from '@/components/ui/SelectTypeRow';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { useAccounts } from '@/context/AccountContext';
import { useBalanceSummary } from '@/hook/useBalanceSummary';
import { useFilteredTransactions } from '@/hook/useFilteredTransactions';
import { buildPieChartData } from '@/utils/buildPieChartData';
import { findBudgetByCategory } from '@/utils/findBudgetByCategory';
import { formatCategory } from '@/utils/formatCategory';
import { formatCurrency } from '@/utils/formatCurrency';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PieChart as GiftedPieChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { expenseCategoryType, incomeCategoryType } from '../constants/categories';

export default function Stat() {

  const { accounts, changeMonth, currentDate, budgets } = useAccounts();
  const allTransactions = accounts.flatMap(acc => acc.transactions || [])
  const { displayTransactions, deposit: deposit, withdrawl: withdrawl, total: total } = useFilteredTransactions(allTransactions);

  const statType = ["Income", "Expense", "Budget"]
  const [selectedType, setSelectedType] = useState<string | null>(null)



  const expensePieChart = buildPieChartData(displayTransactions, 'Expense')
  const incomePieChart = buildPieChartData(displayTransactions, 'Income')
  const activePieChart = selectedType === 'Expense' ? expensePieChart : incomePieChart;

  console.log('currentDate:', currentDate, 'allTransactions count:', allTransactions.length)

  const [categoryType, setCategoryType] = useState<string>('Expense');
  const budgetPieChart = categoryType === 'Income' ? incomePieChart : expensePieChart;


  const totalBudgeted = budgets.reduce((acc, item) => {
    const amt = Number(item.amount) || 0;
    return acc + amt;
  }, 0);

  const balanceSummary = useBalanceSummary();


  const router = useRouter();
  return (
    <SafeAreaView>
      <View style={styles.header}>
        <Text style={styles.header_text}>Statistics</Text>


        <View style={{ paddingVertical: 10, width: '30%' }}>
          <TouchableOpacity
            onPress={() => router.push('/AddBudget')}
            style={styles.ButtonStyle}
          >
            <Text style={{ padding: 2, color: "white", fontWeight: 'bold' }}>+ Add Budget</Text>
          </TouchableOpacity>
        </View>


      </View>
      <MonthNavigator
        date={currentDate.toISOString()}
        onPrevMonth={() => changeMonth(-1)}
        onNextMonth={() => changeMonth(1)}
        income={deposit}
        expense={withdrawl}
        total={total}

      />

      <SelectTypeRow
        transType={statType}
        currentType={selectedType}
        onSelectType={(type) => setSelectedType(type)}
        background='#e3e3e3'
        icon

      />

      {selectedType === 'Budget' ? (

        <View style={{}}>
          <SelectTypeRow
            transType={['Income', 'Expense']}
            currentType={categoryType}
            onSelectType={(type) => setCategoryType(type)}
            background='#e3e3e3'
            style={{
              padding: 2, justifyContent: 'space-around'
            }}
          />

          <SummaryCard
            text1='Budgetd'
            amount1={totalBudgeted}
            text2='Spent'
            amount2={withdrawl}
            text3={(totalBudgeted - withdrawl) <= 0 ? 'Over Limit' : 'Remaining'}
            amount3={totalBudgeted - withdrawl}
          />
          <ScrollView style={styles.budgetBackground}>
            {(categoryType === 'Income' ? incomeCategoryType : expenseCategoryType).map((item, index, arr) => {
              const isLast = index === arr.length - 1;
              const matchingBudgetCategory = findBudgetByCategory(budgets, item)
              const spendInCategory = budgetPieChart.find(p => p.categoryName === item)?.value || 0
              const percentUsed = matchingBudgetCategory ? (spendInCategory / matchingBudgetCategory.amount) * 100 : 0

              return (
                <View key={item}>
                  <SelectAccountTypeRow
                    type={item}
                    text3={findBudgetByCategory(budgets, item)?.amount ? `$${spendInCategory} / $${findBudgetByCategory(budgets, item)?.amount}  ⟩` : ''}
                    children={spendInCategory > 0 &&
                      < View style={{ height: 22, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden', marginHorizontal: 10, justifyContent: 'center', }}>
                        <View style={{ height: '100%', width: `${Math.min(percentUsed, 100)}%`, backgroundColor: percentUsed > 100 ? '#ef4444' : '#10b981' }} />
                        <Text style={{ position: 'absolute', right: 8, color: '#333' }}>
                          {percentUsed.toFixed(0)}%
                        </Text>
                      </View>

                    }
                    style={{
                      paddingHorizontal: 10,
                      padding: 10,
                      borderBottomColor: isLast ? 'white' : '#e0e0e0c2',
                      borderColor: 'white',
                      borderRadius: 0,


                    }}
                  />

                </View>
              )


            })}

          </ScrollView>
        </View >
      )
        :
        (
          <View>
            <View style={[styles.backgroundCard, { alignItems: 'center' }]}>
              <GiftedPieChart donut
                innerRadius={60}
                radius={90}
          

                data={activePieChart} />
              
            </View>

            <View style={styles.backgroundCard}>
              {activePieChart.map((item) => (
                <View key={item.categoryName} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.color, marginRight: 8, }} />
                    <Text>{formatCategory(item.categoryName)}</Text>
                  </View>
                  <Text>{formatCurrency(item.value)}</Text>
                </View>
              ))}

            </View>
          </View>
        )
      }


    </SafeAreaView >

  )


}
const styles = StyleSheet.create({

  budgetBackground: {
    marginHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 20,




  },
  backgroundCard: {
    backgroundColor: 'white',
    borderRadius: 20,

    padding: 10,
    margin: 10


  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 10,
    paddingHorizontal: 0, // 4. Space out the text and the "+" button from the edges.
  },
  header_text: {
    fontSize: 20,
    textAlign: 'left',
    paddingLeft: 10,
    paddingRight: 10,
    flex: 1,
    fontWeight: 'bold',
  },

  ButtonStyle: {
    padding: 5,
    borderRadius: 15,
    backgroundColor: "#366bde",
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',


  }
}
)