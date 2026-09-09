import { GoBack } from "@/components/ui/GoBackButton";
import { SelectAccountTypeRow } from "@/components/ui/SelectAccountTypeRow";
import { SelectTypeRow } from "@/components/ui/SelectTypeRow";
import { useAccounts } from "@/context/AccountContext";
import { findBudgetByCategory } from "@/utils/findBudgetByCategory";
import { IconCircle } from "@/utils/IconCircle";
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { expenseCategoryType, incomeCategoryType } from "./constants/categories";

export default function AddBudget() {


    const { addBudget, budgets, updateBudget, deleteBudget } = useAccounts();
    const [showEditCategory, setShowEditCategory] = useState(false);


    const [categoryType, setCategoryType] = useState<string>('Expense');
    const [categoryAmount, setCategoryAmount] = useState('')
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const existingBudgetForCurrentCategory = findBudgetByCategory(budgets, categoryType);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);


    const handleSave = async () => {

        if (!user) return;


        if (categoryAmount === '0') {
            alert("Please type an amount")
            return
        }
        const existingBuget = findBudgetByCategory(budgets, categoryType);
        if (existingBuget) {
            await updateBudget({
                id: existingBuget.id,
                category: categoryType,
                amount: Number(categoryAmount),
                user_id: user.id,
                start_date: startOfMonth.toISOString(),
                end_date: endOfMonth.toISOString()

            })
        }
        else {
            await addBudget({

                category: categoryType,
                amount: Number(categoryAmount) || 0,
                user_id: user.id,
                start_date: new Date().toISOString(),
                end_date: new Date().toISOString()

            })
        }

        setShowEditCategory(false)

    }
    const router = useRouter();
    console.log(budgets)
    return (
        <SafeAreaView>
            <GoBack
                text="Account"
                onGoBack={() => router.back()}
            />
            <View style={styles.transactionCard}>
                <View style={{ marginHorizontal: 20 }}>
                    <SelectTypeRow
                        transType={['Income', 'Expense']}
                        currentType={categoryType}
                        onSelectType={(type) => setCategoryType(type)}
                        style={{ paddingVertical: 2 }}
                    />
                </View>
                <ScrollView>
                    {(categoryType === 'Income' ? incomeCategoryType : expenseCategoryType).map((item, index, arr) => {
                        const isLast = index === arr.length - 1;

                        const existingBudget = findBudgetByCategory(budgets, item)
                        return (
                            <SelectAccountTypeRow
                                onSelect={() => { setCategoryType(item); setShowEditCategory(true); }}
                                key={item}
                                type={item}
                                text3={existingBudget ? `${existingBudget.amount}` : ''}
                                style={{
                                    padding: 10,
                                    borderBottomColor: isLast ? 'white' : '#e0e0e0a0',
                                    borderColor: 'white',
                                    borderRadius: 0,
                                    bottomBorder: 1,
                                    alignItems: 'center',
                                    marginBottom: 0
                                }}
                            />


                        )
                    })}
                    <Modal
                        visible={showEditCategory}
                        transparent={true} //so we can see the dimmed background
                        animationType="slide"
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.listContainer}>
                                <View style={styles.calendarHeader}>
                                    <Text>{categoryType} </Text>
                                    <IconCircle
                                        icon='close'
                                        iconSize={18}
                                        iconSet='ionicons'
                                        onButton={() => setShowEditCategory(false)}
                                    />
                                </View>
                                <View style={{
                                    flexDirection: 'row', alignItems: 'baseline'
                                }}>
                                    <Text style={{ fontSize: 40 }}>$</Text>
                                    <TextInput style={{ fontSize: 50 }}
                                        keyboardType="numeric"
                                        value={categoryAmount}
                                        placeholder='0'
                                        onChangeText={text => setCategoryAmount(text)}
                                    />

                                </View>


                                {existingBudgetForCurrentCategory &&
                                    <TouchableOpacity style={styles.saveButton} onPress={() => { deleteBudget(existingBudgetForCurrentCategory.id); setShowEditCategory(false) }}>
                                        <Text style={styles.saveButtonText}>Delete</Text>
                                    </TouchableOpacity>}

                                <TouchableOpacity style={styles.saveButton} onPress={() => handleSave()}>
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </TouchableOpacity>

                            </View>

                        </View>

                    </Modal>

                </ScrollView>
            </View>

        </SafeAreaView>

    )
}

const styles = StyleSheet.create({
    transactionCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        paddingTop: 5,
        padding: 10,
        margin: 10,
    },
    cardContainer: {
        backgroundColor: "white",
        flexDirection: 'column',
        borderRadius: 20,
        overflow: 'hidden',
        margin: 10
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
        minHeight: 800,




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
    categoryButton: {

        flexDirection: 'row',
        borderRadius: 20,
        padding: 10,
        margin: 5


    },
    activeTabButton: {
        borderRadius: 8,
        backgroundColor: '#F5F5F7', // Light gray for inactive
        borderWidth: 1,
        borderColor: 'transparent',
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
})
