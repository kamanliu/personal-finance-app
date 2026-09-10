import { formatDate } from '@/utils/formatDate';
import { getTransferLabel } from '@/utils/getTransferLabel';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import Transaction from './Transaction';

type Props = {
    sections: { title: string; data: any[] }[];
    getAccountById: (id?: string) => any;
    getAccountByPlaidId: (id: string) => any;
    onPressItem: (item: any) => (() => void) | undefined;
    emptyText?: string;
};

export function TransactionSectionList({ sections, getAccountById, getAccountByPlaidId, onPressItem, emptyText = 'No transactions found for this month.' }: Props) {
    if (sections.length === 0) {
        return (
            <View style={{ alignItems: 'center', marginTop: 50 }}>
                <Text style={{ fontSize: 16, color: '#6b7280' }}>{emptyText}</Text>
            </View>
        );
    }

    return (
        <View style={styles.transactionCard}>
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Transaction
                        label={item.type === 'Transfer' ? getTransferLabel(item, getAccountById, getAccountByPlaidId) : item.note}
                        value={item.amount}
                        date={item.date}
                        type={item.type}
                        category={item.category}
                        income={item.type === 'Income'}
                        onPress={onPressItem(item)}
                    />
                )}
                renderSectionHeader={({ section }) => (
                    <View style={{ backgroundColor: '#fff', paddingLeft: 10, borderRadius: 20 }}>
                        <Text style={{ marginTop: 10, marginLeft: 5 }}>{formatDate(section.title)}</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    transactionCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        paddingTop: 5,
        margin: 12,
        marginTop: -5,
        borderColor: '#e1e0e0',
    },
});