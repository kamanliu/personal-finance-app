import { supabase } from '@/lib/supabase';


export const PlaidService = {
    getLinkToken: async (user_id: string) => {


        try {
            const { data, error } = await supabase.functions.invoke('plaid-link-token', {
                body: { user_id }
            })
            if (error) {
                console.error('Supabase Invoke Error:', error);
                return null;
            }

            
            console.log("FULL DATA OBJECT:", JSON.stringify(data, null, 2));
            return data?.link_token
        }
        catch (error) {
            console.error('Error getting link token:', error);
            return null;

        }
    },

    exchangeToken: async (public_token: string, user_id: string, institution_name: string) => {
        try {
            const { data, error } = await supabase.functions.invoke('plaid-exchange-token', {
                body: {
                    public_token,
                    user_id,
                    institution_name
                }
            })
            if (error) {
                throw error
            }
            return data;
        }

        catch (error) {
            console.error('Error getting access token: ', error)
            return null;
        }
    }
}