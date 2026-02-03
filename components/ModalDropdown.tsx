import React from 'react';
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
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
    <View style = {styles.container}>


        <Modal visible = {isVisible} transparent animationType = "slide">
             {/* a gatekeeper, if the state is true, the mdoal appears
             transparent: this lets u see the dimmed background behind the pop-up
             animationType = "slide" makes the menu slide up from the buttom */}
            <View style={styles.modalBackground}>
             <View style={styles.modalContent}>
                <FlatList
                // takes your data array and loops through it.
                    data = {data}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({item}) => ( 
                        // for every item in ur list, it creates a clickable row
                        <TouchableOpacity style = {styles.option} onPress={() => handleSelect(item)}>
                             {/* when you tap a specific item, it passes that specific string to the handler */}
                            <Text style = {styles.optionText}>{item}</Text>
                        </TouchableOpacity>
                    )}
                    />
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
        </View>
        </View>
        </Modal>
    </View>
)
}

const styles = StyleSheet.create({
    container:{
        margin: 20
    },
    button: {
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 5,
    },
    buttonText: {
        color: 'black',
        textAlign: 'center',
    },
    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent:{
        width: "80%",
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
    },
    option:{
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor:  "#ddd",

    },
    optionText:{
        fontSize: 16,
    },
    closeButton:{
        marginTop: 10,
        padding: 10,
        backgroundColor: "#e74c3c",
        borderRadius: 5,
    },
    closeText: {
    color: "white",
    textAlign: "center",
  },
})

export default ModalDropdown;
