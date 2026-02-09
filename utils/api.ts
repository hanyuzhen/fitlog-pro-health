
import { supabase } from './supabase';
import { HealthRecord } from '../types';

export const fetchRecords = async (): Promise<HealthRecord[]> => {
    const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching records:', error);
        throw error;
    }

    return (data || []).map((record: any) => ({
        id: record.id,
        date: record.date,
        morningWeight: record.morning_weight,
        eveningWeight: record.evening_weight,
        bmCount: record.bm_count,
        hasBM: record.has_bm,
        notes: record.notes,
    }));
};

export const createRecord = async (record: Omit<HealthRecord, 'id'>): Promise<HealthRecord | null> => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
        console.error('User not logged in', userError);
        return null;
    }

    const { data, error } = await supabase
        .from('health_records')
        .upsert(
            {
                date: record.date,
                morning_weight: record.morningWeight,
                evening_weight: record.eveningWeight,
                bm_count: record.bmCount,
                has_bm: record.hasBM,
                notes: record.notes,
                user_id: userData.user.id,
            },
            { onConflict: 'user_id, date' }
        )
        .select()
        .single();

    if (error) {
        console.error('Error creating/updating record:', error);
        throw error;
    }

    return {
        id: data.id,
        date: data.date,
        morningWeight: data.morning_weight,
        eveningWeight: data.evening_weight,
        bmCount: data.bm_count,
        hasBM: data.has_bm,
        notes: data.notes,
    };
};

export const updateRecord = async (record: HealthRecord): Promise<HealthRecord | null> => {
    const { data, error } = await supabase
        .from('health_records')
        .update({
            date: record.date,
            morning_weight: record.morningWeight,
            evening_weight: record.eveningWeight,
            bm_count: record.bmCount,
            has_bm: record.hasBM,
            notes: record.notes,
        })
        .eq('id', record.id)
        .select()
        .single();

    if (error) {
        console.error('Error updating record:', error);
        throw error;
    }

    return {
        id: data.id,
        date: data.date,
        morningWeight: data.morning_weight,
        eveningWeight: data.evening_weight,
        bmCount: data.bm_count,
        hasBM: data.has_bm,
        notes: data.notes,
    };
};

export const deleteRecord = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('health_records')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting record:', error);
        throw error;
    }
};
