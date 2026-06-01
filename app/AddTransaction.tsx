import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { FlatList, KeyboardAvoidingView, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Transaction, useAccounts } from '../context/AccountContext';
import { useAuth } from '../context/AuthContext';


export default function AddTransaction() {

    const transactionType = ["Income", "Expense", "Transfer"]
    const [selectedTransType, setSelectedTransType] = useState<string | null>(null)
    const expenseCategoryType = ["Food", "Grocery", "Transportation", "Telephone", "Subscription"]
    const incomeCategoryType = ["Salary", "Bonus", "Investment", "Other"]
    const [amount, setAmount] = useState('')
    const [note, setNote] = useState<string>('');
    const [date, setDate] = useState(new Date()); //defaults the transaction to "Right Now."

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    // Connecting to the "brain"
    const { accounts, addTransaction, getAccountById, updateTransaction, getAccountByPlaidId } = useAccounts()
    // pulls in your global list of accounts and the function to save data
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [selectedAccountName, setSelectedAccountName] = useState<string | null>(null);
    const [selectedTargetAccountId, setSelectedTargetAccountId] = useState<string | null>(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showCategory, setShowCategory] = useState(false);
    const [showAccount, setShowAccount] = useState(false);
    const [showSelectedTargetAccount, setShowSelectedTargetAccount] = useState(false);


    const [editingTrans, setEditingTrans] = useState<Transaction | null>(null)
    const { transId } = useLocalSearchParams();
    const { user } = useAuth();
    if (!user) {
        return <Text>Loading user...</Text>; // Or just return null to show a blank screen
    }
    console.log("current user id is ", user?.id)


    const router = useRouter();  // This runs once when the app opens

    useEffect(() => {

        // to look inside the accounts. gotta turn the array of accounts into one single list of all transactions first
        const allTransactions = accounts.flatMap(acc => acc.transactions)
        const match = allTransactions.find(t => t.id === transId)

        setEditingTrans(match || null)

        // the dependency array, without it, it will run after every render since setEditingTrans triggers a re-render
        // [] = run once on mount only, [transId,accounts] = run when these values change
        // no array = run every render
    }, [transId, accounts]

    )
    useEffect(() => {
        if (editingTrans) {
            setSelectedTransType(editingTrans.type)
            setDate(new Date(editingTrans.date ?? new Date()))
            setAmount(editingTrans.amount.toString())
            setSelectedCategory(editingTrans.category)
            setSelectedAccountId(editingTrans.account_id)
            setSelectedTargetAccountId(editingTrans.to_account_id)
            setNote(editingTrans.note || '')
            
            // handle both manual and plaid accounts
            if (editingTrans.source === 'plaid') {
                const plaidAccount = getAccountByPlaidId(editingTrans.account_id)
                setSelectedAccountId(plaidAccount?.id || '') // Use the account UUID
            }else{
                setSelectedAccountId(editingTrans.account_id) // Use the manual account ID
            }
            setSelectedTargetAccountId(editingTrans.to_account_id)
        } else {
            setDate(new Date())
            setAmount('')
            setSelectedCategory('')
            setSelectedAccountId('')
            setNote('')

        }
    }, [editingTrans]
    )

    const handleSave = async () => {


        if (!selectedTransType) {
            alert("Please select a transaction type.")
            return
        }
        if (!selectedCategory) {
            alert("Please select a category.")
            return
        }
        if (!selectedAccountId) {
            alert("Please select an asset type.")
            return
        }

        if (selectedTransType === "Transfer") {

            if (!selectedTargetAccountId) {
                alert("Please select the destination account.");
                return;

            }
            if (selectedAccountId === selectedTargetAccountId) {
                alert("Cannot Transfer to the same account.")
                return
            }

        } else {
            if (!selectedCategory) {
                alert("Please select a category.");
                return;
            }

        }


        try {
            if (editingTrans) {
                await updateTransaction({
                    id: editingTrans.id,
                    type: selectedTransType as "Income" | "Expense" | "Transfer",
                    user_id: user.id,
                    account_id: selectedAccountId,
                    to_account_id: selectedTransType === 'Transfer' ? selectedTargetAccountId : null,
                    amount: Number(amount) || 0,
                    category: selectedCategory || null,
                    date: date.toISOString(),
                    note,
                    source: 'manual',
                }
                )
            } else {
                await addTransaction(
                    {
                        type: selectedTransType as "Income" | "Expense" | "Transfer",
                        user_id: user.id,
                        account_id: selectedAccountId,
                        to_account_id: selectedTargetAccountId || null,
                        amount: Number(amount) || 0,
                        category: selectedCategory || null,
                        date: date.toISOString(),
                        note,
                        source: 'manual',
                    })


            }
            await new Promise(resolve => setTimeout(resolve, 500)); // give it time to refresh

        } catch (e: any) {
            alert("Transaction Failed: " + e.message)
        }


        router.back()


    }
    const onChange = (event: any, selectedDate?: Date) => {
        setShowCalendar(false)
        if (selectedDate) {
            setDate(selectedDate);
        }
    }

    return (
        <SafeAreaView>
            <TouchableOpacity onPress={() => router.back()}><Text>Go Back</Text></TouchableOpacity>
            <View style={styles.formContainer}>
                <View style={styles.header}>
                    {transactionType.map((type) => (
                        <TouchableOpacity
                            key={type}
                            onPress={() => {
                                setSelectedTransType(type)
                                setSelectedCategory(null)
                            }}
                            style={[
                                styles.tabButton,
                                selectedTransType === type && styles.activeTabButton // Compare against the state
                            ]}
                        >
                            <Text>{type}</Text>
                        </TouchableOpacity>
                    ))}

                </View>
                <KeyboardAvoidingView >
                    <View style={styles.form_group}>
                        <Text style={styles.label}>Date: </Text>
                        <TouchableOpacity onPress={() => setShowCalendar(true)}>
                            <Text >{date.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                        <Modal
                            visible={showCalendar}
                            transparent={true} //so we can see the dimmed background
                            animationType="slide"
                        >
                            <View style={styles.modalOverlay}>
                                <View style={styles.calendarContainer}>
                                    <View style={styles.calendarHeader}>
                                        <Text style={styles.headerTitle}>Date</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <TouchableOpacity onPress={() => setDate(new Date())}>
                                                <Text style={{ color: 'white', marginRight: 20 }}>Today</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => setShowCalendar(false)}>
                                                <Text style={styles.closeButton}>X</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <DateTimePicker
                                        value={date}
                                        mode='date'
                                        display='inline'
                                        onChange={(event, selectedDate) => {
                                            if (selectedDate) setDate(selectedDate)
                                            setShowCalendar(false)
                                        }}
                                    />

                                </View>
                            </View>
                        </Modal>

                    </View>

                    <View style={styles.form_group}>
                        <Text style={styles.label}>Amount: </Text>
                        <TextInput style={styles.text_input}
                            value={amount}
                            keyboardType='numeric'
                            onChangeText={text => setAmount(text)}>

                        </TextInput>
                    </View>


                    {selectedTransType === "Transfer" ? (
                        <View style={styles.form_group}>
                            <Text style={styles.label}>From: </Text>
                            <TouchableOpacity onPress={() => setShowAccount(true)}>
                                <Text>{accounts.find(acc => acc.id === selectedAccountId)?.name || 'Select Account'}</Text>
                            </TouchableOpacity>

                            <Modal visible={showAccount} transparent={true} animationType="slide">
                                <View style={styles.modalOverlay}>
                                    <View style={styles.calendarContainer}>
                                        <View style={styles.calendarHeader}>
                                            <Text style={styles.headerTitle}>Account</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <TouchableOpacity onPress={() => setShowAccount(false)}>
                                                    <Text style={styles.closeButton}>X</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <FlatList
                                            data={accounts}
                                            keyExtractor={(item) => item.id}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity style={styles.row} onPress={() => {
                                                    setSelectedAccountId(item.id);
                                                    setSelectedAccountName(item.name);
                                                    setSelectedCategory(null)
                                                    setShowAccount(false);
                                                }}>
                                                    <Text>{item.name}</Text>
                                                </TouchableOpacity>
                                            )}
                                        />
                                    </View>
                                </View>
                            </Modal>

                        </View>

                    ) : (
                        <View style={styles.form_group}>
                            <Text style={styles.label}>Category: </Text>

                            <TouchableOpacity onPress={() => setShowCategory(true)}>
                                <Text>{selectedCategory || 'Select Category'}</Text>
                            </TouchableOpacity>

                            <Modal
                                visible={showCategory} transparent={true} animationType="slide" >
                                <View style={styles.modalOverlay}>
                                    <View style={styles.calendarContainer}>
                                        <FlatList
                                            data={selectedTransType === "Income" ? incomeCategoryType : expenseCategoryType}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity style={styles.row} onPress={() => {
                                                    setSelectedCategory(item);
                                                    setShowCategory(false);
                                                }}

                                                >
                                                    <Text>{item}</Text>
                                                </TouchableOpacity>
                                            )}
                                            keyExtractor={(item) => item}
                                        />

                                    </View>
                                </View>

                            </Modal>
                        </View>
                    )

                    }


                    {selectedTransType === "Transfer" ? (


                        <View style={styles.form_group}>
                            <Text style={styles.label}>To: </Text>
                            <TouchableOpacity onPress={() => setShowSelectedTargetAccount(true)}>
                                <Text>{accounts.find(acc => acc.id === selectedTargetAccountId)?.name || 'Select Account'}</Text>
                            </TouchableOpacity>

                            <Modal visible={showSelectedTargetAccount} transparent={true} animationType="slide">
                                <View style={styles.modalOverlay}>
                                    <View style={styles.calendarContainer}>
                                        <View style={styles.calendarHeader}>
                                            <Text style={styles.headerTitle}>Account</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <TouchableOpacity onPress={() => setShowSelectedTargetAccount(false)}>
                                                    <Text style={styles.closeButton}>X</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <FlatList
                                            data={accounts}
                                            keyExtractor={(item) => item.id}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity style={styles.row} onPress={() => {
                                                    setSelectedTargetAccountId(item.id);
                                                    getAccountById(item.id);
                                                    setSelectedCategory(null)
                                                    setShowSelectedTargetAccount(false);
                                                }}>
                                                    <Text>{item.name}</Text>
                                                </TouchableOpacity>
                                            )}
                                        />
                                    </View>
                                </View>
                            </Modal>




                        </View>
                    ) : (
                        <View style={styles.form_group}>
                            <Text style={styles.label}>Account: </Text>
                            <TouchableOpacity onPress={() => setShowAccount(true)}>
                                <Text>{accounts.find(acc => acc.id === selectedAccountId)?.name || 'Select Account'}</Text>
                            </TouchableOpacity>

                            <Modal visible={showAccount} transparent={true} animationType="slide">
                                <View style={styles.modalOverlay}>
                                    <View style={styles.calendarContainer}>
                                        <View style={styles.calendarHeader}>
                                            <Text style={styles.headerTitle}>Account</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <TouchableOpacity onPress={() => setShowAccount(false)}>
                                                    <Text style={styles.closeButton}>X</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <FlatList
                                            data={accounts}
                                            keyExtractor={(item) => item.id}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity style={styles.row} onPress={() => {
                                                    setSelectedAccountId(item.id);
                                                    setSelectedAccountName(item.name);
                                                    setShowAccount(false);
                                                }}>
                                                    <Text>{item.name}</Text>
                                                </TouchableOpacity>
                                            )}
                                        />
                                    </View>
                                </View>
                            </Modal>




                        </View>
                    )
                    }


                    <View style={styles.form_group}>
                        <Text style={styles.label}>Note: </Text>
                        <TextInput style={styles.text_input}
                            value={note}
                            onChangeText={text => setNote(text)}>
                        </TextInput>
                    </View>
                    <TouchableOpacity style={styles.saveButton} onPress={() => handleSave()}>
                        <Text>Save</Text>
                    </TouchableOpacity>


                </KeyboardAvoidingView >

            </View >
        </SafeAreaView>
    )

}
const styles = StyleSheet.create({

    header: {

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 2,
        borderBottomColor: 'grey',
    },
    formContainer: {
        padding: 20,
    },
    form_group: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10
    },
    label: {
        marginTop: 20
    },
    text_input: {
        width: 200,
        height: 40,
        borderColor: '#bfbfbf',
        borderWidth: 1,
        padding: 1
    },
    accountTypeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#efefef',
        backgroundColor: 'white',
    },
    calendarContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 50, // extra space for the home indicator
        minHeight: 500,
    },

    calendarHeader: {

        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#000',       // Black header from photo #2
        padding: 15,
        alignItems: 'center',

    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Darkens the rest of the screen
        justifyContent: 'flex-end', // Pushes the calendar to the bottom
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        color: 'white',
        fontSize: 20,
    },
    saveButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        marginTop: 20,
        alignItems: 'center',
    },
    tabButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: '#F5F5F7', // Light gray for inactive
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activeTabButton: {
        backgroundColor: '#FFF',
        borderColor: '#FF7A5C', // The orange color from your pic
    },
}
)
