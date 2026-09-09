import React from 'react';
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    View
} from "react-native";

import { IconCircle } from '@/utils/IconCircle';
import { SelectAccountTypeRow } from './ui/SelectAccountTypeRow';
interface DropdownProps {
    data: string[];
    onSelect: (item: string) => void;
    value: string | null;
    isVisible: boolean;
    onClose: () => void;
    // this function takes no arguments(doesnt need any information to run)
    // it's the instruction sent from the parent telling the child how to close
    // itself (usually by setting isVisible to false)

}
const ModalDropdown = ({ data, onSelect, value, isVisible, onClose }: DropdownProps) => {
    // data:string[] tells typescript that data is an array of words
    // onSelect: (item: string) => void tells TypeScript that onSelect 
    // is a function that takes a word(string) and returns nothing(void)

    // props, data is the list of options that the user send, 
    // onSelect is a function that "calls home" to ur main page to 
    // that the user pressed smth


    const handleSelect = (item: string) => {
        // does three things at once when you tap the option
        onSelect(item);         // tell the main screen wt happened
        onClose();              // tell the parent to close the modal


    }



    return (
        <View style={styles.container}>


            <Modal visible={isVisible} transparent animationType="slide">
                {/* a gatekeeper, if the state is true, the mdoal appears
             transparent: this lets u see the dimmed background behind the pop-up
             animationType = "slide" makes the menu slide up from the buttom */}
                <View style={styles.modalBackground}>
                    <View style={styles.modalContent}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom:10, alignItems:'center'}}>
                            <Text style={{fontSize:15}} > Select Account Type</Text>
                            <IconCircle
                                icon='close'
                                iconSize={18}
                                iconSet='ionicons'
                                onButton={() => onClose()}
                            />
                        </View>
                        <FlatList
                            // takes your data array and loops through it.
                            data={data}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (


                                // for every item in ur list, it creates a clickable row

                                <SelectAccountTypeRow
                                    onSelect={() => handleSelect(item)}
                                    type={item}
                                    style={{marginVertical:5}}
                                />
                            )}

                        />
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        margin: 20
    },
    button: {
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 5,
    },

    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: '90%',
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
    },
    option: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",

    },
    optionText: {
        fontSize: 16,
    },

})

export default ModalDropdown;
