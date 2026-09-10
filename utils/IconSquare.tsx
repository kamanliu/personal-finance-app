
import { LinearGradient } from 'expo-linear-gradient';
import { Text, TouchableOpacity } from 'react-native';
import { iconSets } from './IconCircle';

type IconSquareProps = {
    iconColor?: string;
    icon: string;
    iconSet?: keyof typeof iconSets;
    iconSize: number;
    onButton?: () => void;
    accountType?: string;
    

};

export function IconSquare({ iconColor, iconSet, icon, iconSize, onButton, accountType }: IconSquareProps) {
    iconColor = iconColor || '#1a56db'
    const squareSize = iconSize + 24;

    const IconComponent = iconSet ? iconSets[iconSet] : null;
    return (

        <TouchableOpacity onPress={onButton} activeOpacity={0.8}>
            <LinearGradient
                colors={[iconColor, iconColor + '99'] as const}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                    height: squareSize,
                    width: squareSize,
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {IconComponent ?
                    (<IconComponent name={icon as any} size={iconSize} color="#f8fafc" />) 
                    : (
                        <Text style={{ color: "#f8fafc", fontSize: iconSize, fontWeight: 'bold' }}>{icon}</Text>
                    )}
            </LinearGradient>
        </TouchableOpacity>

    );
}

