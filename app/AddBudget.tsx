import { GoBack } from "@/components/ui/GoBackButton";
import { SelectAccountTypeRow } from "@/components/ui/SelectAccountTypeRow";
import { SelectTypeRow } from "@/components/ui/SelectTypeRow";
import { useAccounts } from "@/context/AccountContext";
import { findBudgetByCategory } from "@/utils/findBudgetByCategory";
import { CategoryIcon, IconCircle } from "@/utils/IconCircle";
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { expenseCategoryType, incomeCategoryType } from "./constants/categories";

const KEYPAD_ROWS = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['.', '0', 'del'],
];

export default function AddBudget() {


    const { addBudget, budgets, updateBudget, deleteBudget } = useAccounts();
    const [showEditCategory, setShowEditCategory] = useState(false);


    const [categoryType, setCategoryType] = useState<string>('Expense');
    const [selectedBudgetCategory, setSelectedBudgetCategory] = useState<string>('');
    const [headerColor, setHeaderColor] = useState<string>('');
    const [categoryAmount, setCategoryAmount] = useState('')
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const existingBudgetForCurrentCategory = findBudgetByCategory(budgets, selectedBudgetCategory);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);

    const handleKeyPress = (key: string) => {
        if (key === 'del') {
            setCategoryAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
            return;
        }
        if (key === '.') {
            if (categoryAmount.includes('.')) return;
            setCategoryAmount(prev => `${prev}.`);
            return;
        }
        setCategoryAmount(prev => (prev === '0' ? key : `${prev}${key}`));
    };

    const handleSave = async () => {
        if (!user) return;

        if (categoryAmount === '0') {
            alert("Please type an amount");
            return;
        }
        const existingBuget = findBudgetByCategory(budgets, selectedBudgetCategory);
        if (existingBuget) {
            await updateBudget({
                id: existingBuget.id,
                category: selectedBudgetCategory,
                amount: Number(categoryAmount),
                user_id: user.id,
                start_date: startOfMonth.toISOString(),
                end_date: endOfMonth.toISOString()
            });
        } else {
            await addBudget({
                category: selectedBudgetCategory,
                amount: Number(categoryAmount) || 0,
                user_id: user.id,
                start_date: new Date().toISOString(),
                end_date: new Date().toISOString()
            });
        }

        setShowEditCategory(false);
    };

    const openCategory = (item: string) => {
        setSelectedBudgetCategory(item);
        const existing = findBudgetByCategory(budgets, item);
        setCategoryAmount(existing ? `${existing.amount}` : '0');
        setHeaderColor(CategoryIcon[item.toLowerCase()]?.iconColor ?? '#6b7280');
        setShowEditCategory(true);
    };

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
                                onSelect={() => openCategory(item)}
                                key={item}
                                type={item}
                                text3={existingBudget ? `$${existingBudget.amount}` : ''}
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

                                <LinearGradient

                                    colors={[headerColor + '60', headerColor + '30', headerColor + '10']}

                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 0.7, y: 1 }}

                                >
                                    <View style={styles.dragHandle} />
                                    <View style={styles.categoryHeader}>
                                        <IconCircle
                                            categoryType={selectedBudgetCategory}
                                            iconSize={26}

                                        />
                                        <View style={{ flex: 1, alignItems: 'center' }}>
                                            <Text style={{ fontSize: 18, fontWeight: 'bold', }}>
                                                {selectedBudgetCategory}</Text>
                                            <Text style={{ fontSize: 13, color: '#6b7280', }}>
                                                Set budget limit
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => setShowEditCategory(false)}>
                                            <IconCircle icon='close' iconSize={16} iconSet='ionicons' iconColor='#6b7280' />
                                        </TouchableOpacity>
                                    </View>
                                </LinearGradient>

                                <View style={{
                                    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', paddingTop: 20, paddingBottom: 20
                                }}>

                                    <Text style={{ fontSize: 50 }}>${categoryAmount || '0'}</Text>

                                </View>
                                <View style={styles.keypad}>
                                    {KEYPAD_ROWS.map((row, rowIndex) => (
                                        <View key={rowIndex} style={styles.keypadRow}>
                                            {row.map((key) => (
                                                <TouchableOpacity
                                                    key={key}
                                                    style={[styles.key, key === 'del' && styles.keyDelete]}
                                                    onPress={() => handleKeyPress(key)}
                                                >
                                                    {key === 'del' ? (
                                                        <Feather name="delete" size={20} color="#ef4444" />
                                                    ) : (
                                                        <Text style={styles.keyText}>{key}</Text>
                                                    )}
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    ))}
                                </View>


                                <View style={styles.actionRow}>
                                    {existingBudgetForCurrentCategory && (
                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={() => { deleteBudget(existingBudgetForCurrentCategory.id); setShowEditCategory(false); }}
                                        >
                                            <Feather name="trash-2" size={16} color="#ef4444" style={{ marginRight: 6 }} />
                                            <Text style={styles.deleteButtonText}>Delete</Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                        <Text style={styles.saveButtonText}>Save</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                        </View>

                    </Modal>

                </ScrollView >
            </View >

        </SafeAreaView >

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
        overflow: 'hidden',
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 50, // extra space for the home indicator
        minHeight: 600,




    },
    categoryHeader: {

        flexDirection: 'row',
        justifyContent: 'center',
        width: "100%",
        borderRadius: 20,
        alignItems: 'center',
        padding: 20
    },
    dragHandle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#d1d5db',
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 4,
    },



    iconCircleLarge: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryButton: {

        flexDirection: 'row',
        borderRadius: 20,
        padding: 10,
        margin: 5


    },

    keypad: {
        paddingHorizontal: 20,
        gap: 10,
    },
    keypadRow: {
        flexDirection: 'row',
        gap: 10,
    },
    key: {
        flex: 1,
        height: 56,
        borderRadius: 12,
        backgroundColor: '#f2f3f7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    keyDelete: {
        backgroundColor: '#fee2e2',
    },
    keyText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111',
    },
    activeTabButton: {
        borderRadius: 8,
        backgroundColor: '#F5F5F7', // Light gray for inactive
        borderWidth: 1,
        borderColor: 'transparent',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    deleteButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#fee2e2',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButtonText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: 'bold',
    },
    saveButton: {
        flex: 2,
        backgroundColor: '#ef4444',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
})
