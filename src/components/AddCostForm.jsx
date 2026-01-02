/**
 * AddCostForm.jsx - Component for adding new cost items
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
  Card,
  CardContent,
  Autocomplete
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

/**
 * AddCostForm component
 * Allows users to add new cost items with sum, currency, category, and description
 * @param {Object} props - Component props
 * @param {Object|null} props.db - Database instance
 */
export default function AddCostForm({ db }) {
  const { t } = useTranslation();
  const [sum, setSum] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [availableCategories, setAvailableCategories] = useState([]);

  /**
   * Loads available categories from database and existing costs
   */
  useEffect(function() {
    async function loadCategories() {
      if (!db) return;

      try {
        // Get categories from categories store
        const categoriesFromStore = await db.getCategories();
        const categoryNames = categoriesFromStore.map(c => c.name);

        // Get unique categories from existing costs
        const allCosts = await db.getAllCosts();
        const costCategories = Array.from(new Set(allCosts.map(c => c.category)));

        // Combine and remove duplicates
        const allCategories = Array.from(new Set([...categoryNames, ...costCategories]));
        setAvailableCategories(allCategories.sort());
      } catch (error) {
        // If error, try to get categories from costs only
        try {
          const allCosts = await db.getAllCosts();
          const costCategories = Array.from(new Set(allCosts.map(c => c.category)));
          setAvailableCategories(costCategories.sort());
        } catch (err) {
          // Ignore errors, user can still type manually
          console.warn('Failed to load categories:', err);
        }
      }
    }

    loadCategories();
  }, [db]);

  /**
   * Handles form submission
   */
  const handleSubmit = async function(event) {
    event.preventDefault();
    
    if (!db) {
      toast.error(t('messages.databaseNotInitialized'));
      return;
    }

    // Validate inputs
    const sumValue = parseFloat(sum);
    if (isNaN(sumValue) || sumValue <= 0) {
      toast.error(t('forms.pleaseEnterValid') + ' ' + t('forms.positiveNumber'));
      return;
    }

    if (!category.trim()) {
      toast.error(t('messages.pleaseEnterCategory'));
      return;
    }

    if (!description.trim()) {
      toast.error(t('messages.pleaseEnterDescription'));
      return;
    }

    try {
      await db.addCost({
        sum: sumValue,
        currency: currency,
        category: category.trim(),
        description: description.trim()
      });

      // Reset form and show success message
      setSum('');
      setCurrency('USD');
      setCategory('');
      setDescription('');
      
      // Reload categories to include the new one
      try {
        const allCosts = await db.getAllCosts();
        const costCategories = Array.from(new Set(allCosts.map(c => c.category)));
        const categoriesFromStore = await db.getCategories();
        const categoryNames = categoriesFromStore.map(c => c.name);
        const allCategories = Array.from(new Set([...categoryNames, ...costCategories]));
        setAvailableCategories(allCategories.sort());
      } catch (error) {
        // Ignore errors
      }
      
      toast.success(t('messages.costItemAdded'));
    } catch (error) {
      toast.error(t('messages.failedToSave') + ' cost item: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <Card 
      sx={{ 
        maxWidth: 700, 
        mx: 'auto', 
        borderRadius: 3,
        boxShadow: 4,
        bgcolor: 'background.paper',
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {t('forms.addNewCostItem')}
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label={t('common.sum')}
            type="number"
            value={sum}
            onChange={(e) => setSum(e.target.value)}
            fullWidth
            required
            margin="normal"
            inputProps={{ min: 0, step: 0.01 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />

          <FormControl 
            fullWidth 
            margin="normal" 
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          >
            <InputLabel>{t('common.currency')}</InputLabel>
            <Select
              value={currency}
              label={t('common.currency')}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <MenuItem value="USD">{t('currency.usd')}</MenuItem>
              <MenuItem value="ILS">{t('currency.ils')}</MenuItem>
              <MenuItem value="GBP">{t('currency.gbp')}</MenuItem>
              <MenuItem value="EURO">{t('currency.euro')}</MenuItem>
            </Select>
          </FormControl>

          <Autocomplete
            freeSolo
            options={availableCategories}
            value={category}
            onChange={(event, newValue) => {
              setCategory(typeof newValue === 'string' ? newValue : newValue || '');
            }}
            onInputChange={(event, newInputValue) => {
              setCategory(newInputValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('common.category')}
                required
                margin="normal"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            )}
          />

          <TextField
            label={t('common.description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            required
            margin="normal"
            multiline
            rows={4}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ 
              mt: 3, 
              py: 1.5,
              borderRadius: 2,
              fontSize: '1rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                boxShadow: 4,
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
            disabled={!db}
          >
            {t('forms.addCostItem')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

