
import { PageTitle } from '@/components/ui/PageTitle';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { calculateAccountBalance } from '@/utils/calculateAccountBalance';
import { IconCircle } from '@/utils/IconCircle';
import { useFocusEffect, } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AccountRow } from '../../components/ui/AccountRow';
import { Account, useAccounts } from '../../context/AccountContext';
import { useBalanceSummary } from '../../hook/useBalanceSummary';
import { normalizeAccountType } from '../../utils/normalizeAccountType';



export default function AccountScreen() {

  const { accounts, deleteAccount, refreshData } = useAccounts();
  const [isEditing, setIsEditing] = useState(false);

  const router = useRouter();
  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [])
  );

  // groupBytype is a object
  const groupBytype = accounts.reduce((acc, item) => {
     const normalizedType = normalizeAccountType(item.type);
    if (!acc[normalizedType]) {
        acc[normalizedType] = [];
    }
    acc[normalizedType].push(item);
    return acc
}, {} as Record<string, Account[]>)
    // telling typescript that im create piles where label is
    // a string and the contents are arrays of strings
  const displayOrder = Object.keys(groupBytype);

  const balanceSummary = useBalanceSummary();
  return (
    <SafeAreaView >
      <View style={styles.header}>

        <PageTitle
          text1='Accounts'
         date={new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        />
        <View style = {{flexDirection:'row'}}>
          <IconCircle
            icon='edit'
            iconSize={20}
            iconColor='black'
            iconSet='fontawesomeSix'
            onButton={() => setIsEditing(!(isEditing))}
          />
          <IconCircle
            icon='plus'
            iconSize={20}
            iconColor='black'
            iconSet='antDesign'
            onButton={() => router.push('/AddAccount')}
          />
        </View>

      </View>
      <SummaryCard
        text1='Assets'
        amount1={balanceSummary.assets}
        text2='Liabilities'
        amount2={balanceSummary.liabilities}
        text3='Total'
        amount3={balanceSummary.total}
        icon1='income'
        icon2='expense'
        icon3='balance'
      />

      <ScrollView>
        {displayOrder.map((type) => {
          const typeAccounts = groupBytype[type]
          if (!typeAccounts || typeAccounts.length === 0)
            return null
          return (


            <View style={styles.listContainer} key={type} >
              <View style={{ flexDirection: 'row', alignItems: 'center', margin: 5, marginBottom: 6 }}>
                <IconCircle
                  categoryType={type}
                  iconSize={16}
                />
                <Text style={{ fontSize: 14, color: '#3a3939', paddingLeft: 5 }}>
                  {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}</Text>
              </View>
              {typeAccounts.map((item) => (
                <View style={styles.cardContainer} key={item.id}>
                  <AccountRow
                    name={item.name}
                    balance={

                      item.source === 'manual' ?
                        (calculateAccountBalance(item.transactions, item.account_id).total) :
                        (item.balance || 0)
                    }
                    onPress={() => router.push({ pathname: '/TransactionList', params: { accountId: item.account_id } })}
                    onDelete={() => deleteAccount(item.id)}
                    accountType={type}
                    isEditing={isEditing}
                   color={item.color ?? undefined}
                  />
                </View>
              ))
              }

            </View>
          )
        })
        }

        <View style={{ padding: 10 }}>
          <TouchableOpacity
            onPress={() => router.push('/AddAccount')}
            style={styles.ButtonStyle}
          >
            <IconCircle
              iconSet='antDesign'
              iconSize={18}
              icon='plus'
              iconColor="#1a56db"
            />
            <Text style={{ paddingLeft: 10, color: "#1a56db" }}>Add Account</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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


  listContainer: {
    margin: 10,
    marginTop: 0,

  },
  cardContainer: {
    backgroundColor: "white",
    flexDirection: 'column',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 10,


  },

  button_container: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#1a56db",
    alignItems: 'center',
    justifyContent: 'center'
  },

  delete_button: {
    textAlign: 'right',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    color: 'red'


  },
  sectionHeader: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },

  textStyle: {
    fontWeight: 'bold',
  },

  ButtonStyle: {
    padding: 10,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#1b1b1b30",
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',


  }

});
