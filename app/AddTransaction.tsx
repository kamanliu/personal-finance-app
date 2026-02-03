import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState, } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAccounts } from './context/AccountContext';



export default function AddTransaction() {

    const transactionType = ["Income", "Expense", "Transfer"]
    const [selectedTransType, setSelectedTransType] = useState<string | null>(null)
    const categoryType = ["Food", "Grocery", "Transportation", "Telephone", "Subscription"]
    const [amount, setAmount] = useState('')
    const [note, setNote] = useState<string>('');
    const [date, setDate] = useState(new Date()); //defaults the transaction to "Right Now."

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    // Connecting to the "brain"
    const { accounts, addTransaction } = useAccounts()
    // pulls in your global list of accounts and the function to save data
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [selectedTargetAccountId, setSelectedTargetAccountId] = useState<string | null>(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showCategory, setShowCategory] = useState(false);
    const [showAccount, setShowAccount] = useState(false);
     const [showselectedTargetAccount, showSelectedTargetAccount] = useState(false);


    const router = useRouter();

    const handleSave = () => {
        if (selectedTransType === "Transfer" && selectedTargetAccountId === selectedTargetAccountId ){
             alert("Cannot Transfer to the same account.")
            return
        }
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
        

        addTransaction(selectedAccountId,
            {
                type: selectedTransType as "Income" | "Expense" | "Transfer",
                account: selectedAccountId,
                toAccount: selectedTargetAccountId || undefined,
                id: Math.floor(Date.now() / 1000).toString(),
                date: date.toLocaleDateString(),
                amount: Number(amount) || 0,
                category: selectedCategory,
                note,
            })
        router.back()
    }
    const onChange = (event: any, selectedDate?: Date) => {
        setShowCalendar(false)
        if (selectedDate) {
            setDate(selectedDate);
        }
    }

    return (
        <View style={styles.formContainer}>
            <View style={styles.header}>
                {transactionType.map((type) => (
                    <TouchableOpacity
                        key={type}
                        onPress={() => (setSelectedTransType(type))} style={[
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
                                    data={categoryType}
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
