import { GoBack } from '@/components/ui/GoBackButton';
import { SelectAccountTypeRow } from '@/components/ui/SelectAccountTypeRow';
import { CategoryIcon } from '@/utils/IconCircle';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ModalDropdown from '../components/ModalDropdown';
import { useAccounts } from '../context/AccountContext';
import { useAuth } from '../context/AuthContext';



export default function AddAccount() {
  const accountTypes = ["Cash", "Account", "Card"];
  const { addAccount, addTransaction } = useAccounts(); // Get the shared function
  const router = useRouter();

  const [name, setName] = useState<string>('');
  const [amount, setAmount] = useState('')

  const [selectedType, setSelectedType] = useState<string | null>(null);
  // This tells the computer: "This box can hold text (a string) OR it can be empty (null).

  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(true);
  const [accountColor, setAccountColor] = useState<string | null>(null);
  const { user } = useAuth();



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


  const handleSave = async () => {

    if (!selectedType || !name.trim()) {
      setError("There is no title for the account.")
      return;
    }
    if (!user) return;

    const newAccount = await addAccount({

      type: selectedType,
      name,
      balance: 0,
      user_id: user.id,
      source: 'manual',
      color: accountColor

    });

    if (!newAccount) return;
    if (Number(amount) > 0) {
      await addTransaction({
        type: "Income",
        user_id: user.id,
        account_id: newAccount.account_id || newAccount.id,
        amount: Number(amount) || 0,
        category: null,
        date: new Date().toISOString(),
        note: "Opening Balance",
        source: 'manual',
      })
    }
    // Go back to AccountScreen

    router.back()
  }

  const colorOptions = ['#1a56db', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#6b7280'];
  return (
    <SafeAreaView>

      <KeyboardAvoidingView >

        <View style={styles.header}>


          <GoBack
            text="Account"
            onGoBack={() => router.back()}
          />
          <ModalDropdown
            data={accountTypes}
            onSelect={(item) => setSelectedType(item)}
            value={selectedType}
            isVisible={isModalVisible}
            onClose={() => setModalVisible(false)}
          />
        </View>
        <View style={styles.formContainer}>


          <View >
            <Text style={styles.title}>Account Details</Text>
            <SelectAccountTypeRow
              onSelect={() => setModalVisible(true)}
              type={selectedType || 'Select Account Type'}
              style={{
                marginVertical:10,
                borderWidth: 0,
                backgroundColor: `${(CategoryIcon[selectedType?.toLocaleLowerCase() || ''] || { iconColor: '#6d6c6c' }).iconColor}18`,
              }}
              textColor={(CategoryIcon[selectedType?.toLocaleLowerCase() || ''] || { iconColor: '#6d6d6d' }).iconColor}
            />

            <Text style={{ color: '#6b7280' }}>Account Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Chequing account, Saving account"
              value={name}
              onChangeText={text => setName(text)}
            />
            <Text style={{ color: '#6b7280' }}>Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 10.00"
              value={amount}
              keyboardType="numeric"
              onChangeText={text => setAmount(text)}
            />
            <Text style={{ color: '#6b7280' }}>Account Color</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 }}>
              {colorOptions.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setAccountColor(color)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: color,
                    outlineWidth: 2,
                    outlineOffset: 2,
                    outlineColor: accountColor === color ? accountColor : 'white',
                  }}
                />
              ))}
            </View>


            <TouchableOpacity style={styles.saveButton} onPress={() => handleSave()}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            {error && <Text style={styles.errorText}>{error}</Text>}


          </View>

        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>

  );

}
const styles = StyleSheet.create({


  header: {

    flexDirection: 'row',
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

    fontSize: 20,
    paddingBottom: 20,

  },
  input: {
    padding: 15,
    backgroundColor: '#fcfcfc',
    borderRadius: 15,
    borderColor: '#efe8e8fd',
    borderWidth: 1,
    marginVertical: 10,
  },
  formContainer: {
    marginTop: 0,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 10

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
    backgroundColor: '#2356fc18',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#2356fc',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },


});
