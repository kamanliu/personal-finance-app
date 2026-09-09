import { StyleSheet, Text, View } from 'react-native';

type PageTitleProps = {
    text1:string;
    date:string;
}

export function PageTitle({ text1, date}: PageTitleProps) {
    return(
    <View style={styles.header}>
        <Text style = {{color:'grey', fontWeight:'bold'}}>{date}</Text>
        <Text style={styles.header_text}>{text1}</Text>
    </View>
        )
}

const styles = StyleSheet.create({

  header: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingHorizontal:20
    
    
  },
  header_text: {

    fontSize: 25,
    fontWeight: 'bold',
  },})