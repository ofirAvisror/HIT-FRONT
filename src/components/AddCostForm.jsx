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
import toast from 'react-hot-toast';

/**
 * AddCostForm component
 * Allows users to add new cost items with sum, currency, category, and description
 * @param {Object} props - Component props
 * @param {Object|null} props.db - Database instance
 */
export default function AddCostForm({ db }) {
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
      toast.error('Database not initialized');
      return;
    }

    // Validate inputs
    const sumValue = parseFloat(sum);
    if (isNaN(sumValue) || sumValue <= 0) {
      toast.error('Please enter a valid positive number for sum');
      return;
    }

    if (!category.trim()) {
      toast.error('Please enter a category');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a description');
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
      
      toast.success('Cost item added successfully!');
    } catch (error) {
      toast.error('Failed to add cost item: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
            ➕ Add New Cost Item
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Sum"
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
            <InputLabel>Currency</InputLabel>
            <Select
              value={currency}
              label="Currency"
              onChange={(e) => setCurrency(e.target.value)}
            >
              <MenuItem value="USD">USD - US Dollar</MenuItem>
              <MenuItem value="ILS">ILS - Israeli Shekel</MenuItem>
              <MenuItem value="GBP">GBP - British Pound</MenuItem>
              <MenuItem value="EURO">EURO - Euro</MenuItem>
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
                label="Category"
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
            label="Description"
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
            Add Cost Item
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

