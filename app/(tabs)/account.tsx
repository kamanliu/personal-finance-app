import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Account, useAccounts } from '../context/AccountContext';

export default function AccountScreen() {

  const { accounts, deleteAccount } = useAccounts();
  const router = useRouter();


  // groupBytype is a object
  const groupBytype = accounts.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }

    acc[item.type].push(item);
    return acc
  }, {} as Record<string, Account[]>
    // telling typescript that im create piles where label is
    // a string and the contents are arrays of strings
  )
  return (
    <SafeAreaView style={styles.content_container} >
      <View style={styles.header}>
        <Text style={styles.header_text}>Accounts</Text>
        <TouchableOpacity style={styles.button_container} onPress={() => router.push('/AddAccount')}>
          <Text >+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.listAccount} >
        {Object.entries(groupBytype).map(([type, accounts]) => (
          <View key={type} >
            <Text style={styles.header}>{type}</Text>

            {accounts.map((item) => (

              <View style={styles.listContainer} key={item.id}>
                <Text >  {`${item.name} • ${item.amount}`}</Text>
                <TouchableOpacity style={styles.delete_button} onPress={() => deleteAccount(item.id)}>
                    <Text >Delete</Text>
                </TouchableOpacity>

              </View>

            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>

  );
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
  },

  listAccount: {
    flex: 1, 
    flexDirection: 'column', 
    padding: 10,
  },
  listContainer:{
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  button_container: {
    fontSize: 16,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'right',
    padding: 10
    
  },

  delete_button: {
    textAlign: 'right',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    color: 'red'
    

  }

});
