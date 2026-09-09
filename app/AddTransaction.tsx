import { GoBack } from '@/components/ui/GoBackButton';
import { SelectTypeRow } from '@/components/ui/SelectTypeRow';
import { IconCircle } from '@/utils/IconCircle';
import { IconSquare } from '@/utils/IconSquare';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Transaction, useAccounts } from '../context/AccountContext';
import { useAuth } from '../context/AuthContext';
import { expenseCategoryType, incomeCategoryType } from "./constants/categories";

export default function AddTransaction() {

    const transactionType = ["Income", "Expense", "Transfer"]
    const [selectedTransType, setSelectedTransType] = useState<string | null>(null)

    const [amount, setAmount] = useState('')
    const [note, setNote] = useState<string>('');
    const [date, setDate] = useState(new Date()); //defaults the transaction to "Right Now."

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    // Connecting to the "brain"
    const { accounts, addTransaction, getAccountById, updateTransaction, deleteTrans } = useAccounts()
    // pulls in your global list of accounts and the function to save data
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [selectedAccountName, setSelectedAccountName] = useState<string | null>(null);
    const [selectedTargetAccountId, setSelectedTargetAccountId] = useState<string | null>(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showCategory, setShowCategory] = useState(false);
    const [showAccount, setShowAccount] = useState(false);
    const [showSelectedTargetAccount, setShowSelectedTargetAccount] = useState(false);


    const [editingTrans, setEditingTrans] = useState<Transaction | null>(null)

    const manualAccounts = accounts.filter(acc => acc.source === 'manual')

    // const getAccountIdForDb = (accountId: string | null) => {
    //     if(!accountId) return undefined;
    //     const account = accounts.find(acc => acc.id === accountId);
    //     return account?.account_id || accountId;
    // }
    const { transId } = useLocalSearchParams();
    const { user } = useAuth();
    if (!user) {
        return <Text style={styles.textStyle}>Loading user...</Text>; // Or just return null to show a blank screen
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
            setNote(editingTrans.note || '')
            setSelectedTargetAccountId(editingTrans.to_account_id)
        } else {
            setDate(new Date())
            setAmount('')
            setSelectedCategory('')
            setSelectedAccountId('')
            setSelectedTargetAccountId('')
            setNote('')

        }
    }, [editingTrans]
    )

    const handleSave = async () => {


        if (!selectedTransType) {
            alert("Please select a transaction type.")
            return
        }
        if (!selectedCategory && selectedTransType !== "Transfer") {
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

    const finalNote = note || selectedCategory || '';
        try {
            if (editingTrans) {
                await updateTransaction({
                    id: editingTrans.id,
                    type: selectedTransType as "Income" | "Expense" | "Transfer",
                    user_id: user.id,
                    account_id: selectedAccountId || '',
                    to_account_id: selectedTransType === 'Transfer' ? (selectedTargetAccountId || '') : null,
                    amount: Number(amount) || 0,
                    category: selectedCategory || null,
                    date: date.toISOString(),
                    note: finalNote,
                    source: 'manual',
                }
                )
            } else {
                await addTransaction(
                    {
                        type: selectedTransType as "Income" | "Expense" | "Transfer",
                        user_id: user.id,
                        account_id: selectedAccountId || '',
                        to_account_id: selectedTransType === 'Transfer' ? (selectedTargetAccountId) || '' : null,
                        amount: Number(amount) || 0,
                        category: selectedCategory || null,
                        date: date.toISOString(),
                        note: finalNote,
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
            <GoBack
                text="Account"
                onGoBack={() => router.back()}
            />
            <View style={styles.container}>

                <SelectTypeRow
                    transType={transactionType}
                    currentType={selectedTransType}
                    onSelectType={(type) => setSelectedTransType(type)}
                    onSelectCategory={(category) => setSelectedCategory(null)
                    }
                    icon
                />

                <KeyboardAvoidingView >
                    <View style={styles.formContainer}>
                        <View style={styles.form_group}>
                            <Text style={styles.textStyle}>Date: </Text>
                            <TouchableOpacity style={styles.rowStyle} onPress={() => setShowCalendar(true)}>
                                <Text style={styles.textStyle}>{date.toLocaleDateString()}</Text>
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
                                                    <Text style={{ marginRight: 20 }}>Today</Text>
                                                </TouchableOpacity>
                                                <IconCircle
                                                    icon='close'
                                                    iconSize={18}
                                                    iconSet='ionicons'
                                                    onButton={() => setShowCalendar(false)}
                                                />

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
                            <Text style={styles.textStyle}>Amount: </Text>
                            <View style={styles.rowStyle} >
                                <TextInput style={styles.text_input}
                                    value={amount}
                                    keyboardType='numeric'
                                    placeholder="e.g. 10.00"
                                    onChangeText={text => setAmount(text)}>

                                </TextInput>
                            </View>
                        </View>


                        {selectedTransType === "Transfer" ? (
                            <View style={styles.form_group}>
                                <Text style={styles.textStyle}>From: </Text>
                                <TouchableOpacity style={styles.rowStyle} onPress={() => setShowAccount(true)}>
                                    <Text style={styles.textStyle}>{accounts.find(acc => acc.account_id === selectedAccountId && acc.source === 'manual')?.name || 'Select Account'}</Text>
                                </TouchableOpacity>

                                <Modal visible={showAccount} transparent={true} animationType="slide">
                                    <View style={styles.modalOverlay}>
                                        <View style={styles.listContainer}>
                                            <View style={styles.calendarHeader}>
                                                <Text style={styles.headerTitle}>Account</Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                                                    <IconCircle
                                                        icon='close'
                                                        iconSize={18}
                                                        iconSet='ionicons'
                                                        onButton={() => setShowAccount(false)}
                                                    />
                                                </View>
                                            </View>
                                            <FlatList
                                                data={manualAccounts}
                                                keyExtractor={(item) => item.id}
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity style={styles.row} onPress={() => {
                                                        setSelectedAccountId(item.account_id);
                                                        setSelectedAccountName(item.name);
                                                        setSelectedCategory(selectedTransType)
                                                        setShowAccount(false);
                                                    }}>
                                                        <IconSquare
                                                            icon={item.name.charAt(0)}
                                                            iconSize={16}
                                                            iconColor={item.color || 'grey'}
                                                        />
                                                        <Text style={{ paddingHorizontal: 10 }}>{item.name}</Text>
                                                    </TouchableOpacity>
                                                )}
                                            />
                                        </View>
                                    </View>
                                </Modal>

                            </View>

                        ) : (
                            <View style={styles.form_group}>
                                <Text style={styles.textStyle}>Category: </Text>

                                <TouchableOpacity style={styles.rowStyle} onPress={() => setShowCategory(true)}>
                                    <Text style={styles.textStyle}>{selectedCategory || 'Select Category'}</Text>
                                </TouchableOpacity>

                                <Modal
                                    visible={showCategory} transparent={true} animationType="slide" >
                                    <View style={styles.modalOverlay}>
                                        <View style={styles.calendarContainer}>

                                            <View style={styles.calendarHeader}>
                                                <Text style={styles.textStyle}>Select A Category</Text>
                                                <IconCircle
                                                    icon='close'
                                                    iconSize={18}
                                                    iconSet='ionicons'
                                                    onButton={() => setShowCategory(false)}
                                                />
                                            </View>
                                            <View style={[styles.categoryList, { flexDirection: 'row' }]}>
                                                {(selectedTransType === "Income" ? incomeCategoryType : expenseCategoryType).map((item) =>
                                                (<TouchableOpacity key={item} style={styles.categoryButton}

                                                    onPress={() => {
                                                        setSelectedCategory(item);
                                                        setShowCategory(false);
                                                    }}

                                                >
                                                    <Text style={styles.textStyle}>{item}</Text>
                                                </TouchableOpacity>))}
                                            </View>

                                        </View>
                                    </View>

                                </Modal>
                            </View>
                        )

                        }


                        {selectedTransType === "Transfer" ? (


                            <View style={styles.form_group}>
                                <Text style={styles.textStyle}>To: </Text>
                                <TouchableOpacity style={styles.rowStyle} onPress={() => setShowSelectedTargetAccount(true)}>
                                    <Text style={styles.textStyle}>{accounts.find(acc => acc.account_id === selectedTargetAccountId)?.name || 'Select Account'}</Text>
                                </TouchableOpacity>

                                <Modal visible={showSelectedTargetAccount} transparent={true} animationType="slide">
                                    <View style={styles.modalOverlay}>
                                        <View style={styles.listContainer}>
                                            <View style={styles.calendarHeader}>
                                                <Text style={styles.headerTitle}>Account</Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                                                    <IconCircle
                                                        icon='close'
                                                        iconSize={18}
                                                        iconSet='ionicons'
                                                        onButton={() => setShowSelectedTargetAccount(false)}
                                                    />
                                                </View>
                                            </View>
                                            <FlatList
                                                data={manualAccounts}
                                                keyExtractor={(item) => item.id}
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity style={styles.row} onPress={() => {
                                                        setSelectedTargetAccountId(item.account_id);
                                                        setSelectedCategory(selectedTransType)
                                                        setShowSelectedTargetAccount(false);
                                                    }}>
                                                        <IconSquare
                                                            icon={item.name.charAt(0)}
                                                            iconSize={16}
                                                            iconColor={item.color || 'grey'}
                                                        />
                                                        <Text style={{ paddingHorizontal: 10 }}>{item.name}</Text>
                                                    </TouchableOpacity>
                                                )}
                                            />
                                        </View>
                                    </View>
                                </Modal>




                            </View>
                        ) : (
                            <View style={styles.form_group}>
                                <Text style={styles.textStyle}>Account: </Text>
                                <TouchableOpacity style={styles.rowStyle} onPress={() => setShowAccount(true)}>
                                    <Text style={styles.textStyle}>{accounts.find(acc => acc.account_id === selectedAccountId)?.name || 'Select Account'}</Text>
                                </TouchableOpacity>

                                <Modal visible={showAccount} transparent={true} animationType="slide">
                                    <View style={styles.modalOverlay}>
                                        <View style={styles.listContainer}>
                                            <View style={styles.calendarHeader}>
                                                <Text style={styles.headerTitle}>Account</Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                                                    <IconCircle
                                                        icon='close'
                                                        iconSize={18}
                                                        iconSet='ionicons'
                                                        onButton={() => setShowAccount(false)}
                                                    />
                                                </View>
                                            </View>
                                            <FlatList
                                                data={manualAccounts}
                                                keyExtractor={(item) => item.id}
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity style={styles.row} onPress={() => {

                                                        setSelectedAccountId(item.account_id);
                                                        setSelectedAccountName(item.name);
                                                        setShowAccount(false);
                                                    }}>
                                                        <IconSquare
                                                            icon={item.name.charAt(0)}
                                                            iconSize={16}
                                                            iconColor={item.color || 'grey'}
                                                        />
                                                        <Text style={{ paddingHorizontal: 10 }}>{item.name}</Text>
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
                            <Text style={styles.textStyle}>Note: </Text>
                            <View style={styles.rowStyle}>
                                <TextInput style={styles.text_input}
                                    value={note}
                                    placeholder='e.g. Other'
                                    onChangeText={text => setNote(text)}>
                                </TextInput>

                            </View>
                        </View>
                        <TouchableOpacity style={styles.saveButton} onPress={() => handleSave()}>
                            <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                        {editingTrans &&
                            <TouchableOpacity style={styles.saveButton} onPress={() => { deleteTrans(editingTrans.id); router.back() }}>
                                <Text style={styles.saveButtonText}>Delete</Text>
                            </TouchableOpacity>}

                    </View>
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
    container: {
        margin: 10,
        backgroundColor: 'white',
        borderRadius: 20
    },
    formContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        margin: 10

    },
    form_group: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,


    },

    rowStyle: {

        alignItems: 'flex-end',
        padding: 10,
        backgroundColor: "#f7f8fb",
        borderRadius: 15,
        borderColor: "#e7e8eb",
        borderWidth: 1,
        width: "70%"


    },
    textStyle: {
        color: '#3a3a3a',
        textAlign: 'right'

    },
    text_input: {
        borderRadius: 10,
        color: '#3a3a3a',


    },
    accountTypeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Darkens the rest of the screen
        justifyContent: 'flex-end', // Pushes the calendar to the bottom


    },

    calendarContainer: {
        padding: 10,
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 50, // extra space for the home indicator
        minHeight: 300,
        alignItems: 'center'

    },
    listContainer: {
        padding: 10,
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 50, // extra space for the home indicator
        minHeight: 300,


    },


    headerTitle: {
        color: 'Grey',
        fontSize: 18,
        fontWeight: 'bold',
        padding: 10
    },
    calendarHeader: {

        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: "#f2f3f7",       // Black header from photo #2
        padding: 10,
        width: "100%",
        borderRadius: 20,
        alignItems: 'center'


    },
    row: {
        flexDirection: 'row',

        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#efefef',
        backgroundColor: 'white',
        padding: 10
    },

    categoryList: {
        backgroundColor: 'white',
        padding: 10,
        flexWrap: 'wrap',
        justifyContent: 'space-between',



    }
    ,
    categoryButton: {
        backgroundColor: "#f2f3f7",
        flexDirection: 'row',
        borderRadius: 20,
        padding: 10,
        margin: 5


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
    tabButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: '#F5F5F7', // Light gray for inactive
        borderWidth: 1,
        borderColor: 'transparent',
    },



}
)
