import { AntDesign, Entypo, Feather, FontAwesome, FontAwesome5, FontAwesome6, Foundation, Ionicons, MaterialCommunityIcons, MaterialIcons, Octicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';

export const iconSets = {
    ionicons: Ionicons,
    feather: Feather,
    antDesign: AntDesign,
    materialIcons: MaterialIcons,
    entypo: Entypo,
    materialCI: MaterialCommunityIcons,
    fontawesome: FontAwesome,
    fontawesomeFive: FontAwesome5,
    fontawesomeSix: FontAwesome6,
    octicons: Octicons,
    foundation: Foundation
};


type IconCircleProps = {
    iconColor?: string;
    icon?: string;
    iconSize: number;
    iconSet?: keyof typeof iconSets;
    categoryType?: string;
    onButton?: () => void;
    noBackground?: boolean;
    style?: object;
};
export const CategoryIcon: Record<string, IconCircleProps> = {
    "income": {  icon: "arrow-up-right",iconColor: "#10b981", iconSize: 16, iconSet: "feather" },
    "expense": { icon:"arrow-down-left", iconColor:"#ef4444", iconSize:16, iconSet:"feather" },
    "balance":{icon:"building-o", iconColor:"#1a56db", iconSize:16, iconSet:"fontawesome"},
    "salary": { icon: 'account-book', iconColor: "#1a56db", iconSize: 22, iconSet: 'antDesign' },
    "bonus": { icon: 'price-ribbon', iconColor: "#f59e0b", iconSize: 22, iconSet: 'entypo' },
    "allowance": { icon: 'hand-holding-usd', iconColor: "#8b5cf6", iconSize: 22, iconSet: 'fontawesomeFive' },
    "investment": { icon: 'stock', iconColor: "#10b981", iconSize: 22, iconSet: 'antDesign' },
    "cash": { icon: 'wallet-outline', iconColor: "#10b981", iconSize: 22, iconSet: 'materialCI' },
    "card": { icon: 'credit-card', iconColor: "#1a56db", iconSize: 22, iconSet: 'octicons' },
    "account": { icon: 'piggy-bank-outline', iconColor: "#8b5cf6", iconSize: 22, iconSet: 'materialCI' },
    "depository": { icon: 'landmark-dome', iconColor: "#f59e0b", iconSize: 22, iconSet: 'fontawesomeSix' },
    "bank fees": { icon: 'bank-outline', iconSize: 22, iconSet: 'materialCI', iconColor: "#516fe6" },
    "transfer out": { icon: 'money-bill-transfer', iconSize: 22, iconSet: 'fontawesomeSix', iconColor: "#e92d2d" },
    "transfer in": { icon: 'money-bill-transfer', iconSize: 22, iconSet: 'fontawesomeSix', iconColor: "#f59e0b" },
    "transfer": { icon: 'money-bill-transfer', iconSize: 22, iconSet: 'fontawesomeSix', iconColor: "#f5d20b" },
    "loan payments": { icon: "cash-refund", iconSize: 22, iconSet: 'materialCI', iconColor: "#dc2626" },
    "loan": { icon: "cash-refund", iconSize: 22, iconSet: 'materialCI', iconColor: "#dc2626" },
    "food": { icon: "food", iconSize: 22, iconSet: "materialCI", iconColor: "#f9c016" },
    "grocery": { icon: "local-grocery-store", iconSize: 22, iconSet: 'materialIcons', iconColor: "#f97316" },
    "shopping": { icon: "shopping-cart", iconSize: 22, iconSet: "feather", iconColor: "#faa4e7" },
    "clothing": { icon: "tshirt", iconSize: 22, iconSet: "fontawesomeSix", iconColor: "#f59e0b" },
    "transportation": { icon: "car", iconSize: 22, iconSet: "antDesign", iconColor: "#1a56db" },
    "telephone": { icon: "telephone", iconSize: 22, iconSet: "foundation", iconColor: "#0ba7f5" },
    "housing": { icon: "house-chimney-window", iconSize: 22, iconSet: 'fontawesomeSix', iconColor: "#ef6644" },
    "entertainment": { icon: "party-popper", iconSize: 22, iconSet: 'materialCI', iconColor: "#8b5cf6" },
    "health": { icon: "hand-holding-heart", iconSize: 22, iconSet: 'fontawesomeFive', iconColor: "#10b981" },
    "travel": { icon: "airplane", iconSize: 22, iconSet: 'materialCI', iconColor: "#1a56db" },
    "subscription": { icon: "subscriptions", iconSize: 22, iconSet: 'materialIcons', iconColor: "#db1a44" },
    "utilities": { icon: "tools", iconSize: 22, iconSet: 'fontawesomeFive', iconColor: "#0b80f5" },
    "other": { icon: "archive", iconSize: 22, iconSet: 'entypo', iconColor: "#6b7280" },
  
    
}

export function IconCircle({ iconColor, icon, iconSize, iconSet, categoryType, onButton, noBackground,style}: IconCircleProps) {

    const matched = CategoryIcon[categoryType?.toLocaleLowerCase() || ''] ||
    {
        iconColor: iconColor || "#303030",
        icon: icon || 'ellipsis',
        iconSize: iconSize,
        iconSet: iconSet || 'antDesign'
    }


    const MainIcon = matched.iconSet ? iconSets[matched.iconSet] : undefined;
    if (!MainIcon) {
        return null; // Return null if the iconSet is not provided or invalid
    }
    const circleSize = iconSize / 2 - 2;


    const Wrapper = onButton ? TouchableOpacity : View;
    return (

        <Wrapper onPress={onButton} style={[{ padding: circleSize, borderRadius: 22, backgroundColor: noBackground ? 'transparent' : `${matched.iconColor}18`, alignItems: 'center', justifyContent: 'center' },style]}>
            <MainIcon name={matched.icon as any} size={iconSize} color={matched.iconColor} />
        </Wrapper>

    );
}


