import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ModalDropdown from '../components/ModalDropdown';
import { useAccounts } from './context/AccountContext';


export default function AddAccount() {
  const accountTypes = ["Cash", "Account", "Card"];
  const { addAccount } = useAccounts(); // Get the shared function
  const router = useRouter();

  const [name, setName] = useState<string>('');
  const [amount, setAmount] = useState('')

  const [selectedType, setSelectedType] = useState<string | null>(null);
  // This tells the computer: "This box can hold text (a string) OR it can be empty (null).

  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(true);




  // const addAccount = () => {
  //   if (!selectedType || !name.trim() ){
  //     setError("There is no title for the account.")
  //     return;
  //   }
  //   // Math.floor(Date.now() / 1000) converts milliseconds to seconds
  //   setSelectedList(prev =>[...prev, {id: Math.floor(Date.now() / 1000).toString(),
  //      type: selectedType,name,amount:Number(amount)}])
  //   setSelectedType(null)
  //   setName('')
  //   setAmount('')
  //   setError(null)
  // }
  const handleSave = () => {
    if (!selectedType || !name.trim()) {
      setError("There is no title for the account.")
      return;
    }
    addAccount({
      id: Math.floor(Date.now() / 1000).toString(),
      type: selectedType,
      name,
     balance: Number(amount) || 0,
      transactions: [],
    })

    // Go back to AccountScreen
    router.back()
  }


  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add Account</Text>

          <ModalDropdown
            data={accountTypes}
            onSelect={(item) => setSelectedType(item)}
            value={selectedType}
            isVisible={isModalVisible}
            onClose={() => setModalVisible(false)}
          />
        </View>
        <ScrollView>


          <View style={styles.formContainer}>
            <View style={styles.accountTypeRow}>
              <Text style={styles.label}>Account: </Text>
              <TouchableOpacity style={styles.accountTypeButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.accountTypeText}>
                  {selectedType || 'Select Account Type'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Account Name"
              value={name}
              onChangeText={text => setName(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Amount"
              value={amount}
              keyboardType="numeric"
              onChangeText={text => setAmount(text)}
            />

            <TouchableOpacity style={styles.saveButton} onPress={() => handleSave()}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            {error && <Text style={styles.errorText}>{error}</Text>}

          </View>

        </ScrollView>

      </KeyboardAvoidingView>
    </SafeAreaView>

  );

}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: 'grey',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  input: {
    padding: 15, width: '60%',
    backgroundColor: '#FFF',
    borderRadius: 60,
    borderColor: '#C0C0C0',
    borderWidth: 1,
    marginVertical: 10,
  },
  formContainer: {
    padding: 20,
  },
  accountTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '300',
    marginRight: 10,
  },
  accountTypeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  accountTypeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },


});
