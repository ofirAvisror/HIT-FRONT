/**
 * ExportDialog.tsx - Dialog for exporting data
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  FormControl
} from '@mui/material';
import { CostsDB, DateStructure } from '../../types/index';
import { exportToCSV, exportToPDF } from '../../lib/exportHelpers';
import toast from 'react-hot-toast';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  db: CostsDB | null;
}

/**
 * ExportDialog component
 */
export default function ExportDialog({ open, onClose, db }: ExportDialogProps): JSX.Element {
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [startDate, setStartDate] = useState<DateStructure>(() => {
    const date = new Date();
    return { year: date.getFullYear(), month: date.getMonth() + 1, day: 1 };
  });
  const [endDate, setEndDate] = useState<DateStructure>(() => {
    const date = new Date();
    return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
  });
  const [selectedColumns, setSelectedColumns] = useState<string[]>(['date', 'category', 'description', 'amount', 'currency']);
  const [loading, setLoading] = useState<boolean>(false);

  const columns = [
    { id: 'date', label: 'Date' },
    { id: 'category', label: 'Category' },
    { id: 'description', label: 'Description' },
    { id: 'amount', label: 'Amount' },
    { id: 'currency', label: 'Currency' },
  ];

  const handleColumnToggle = function(columnId: string): void {
    setSelectedColumns(function(prev) {
      if (prev.includes(columnId)) {
        return prev.filter(id => id !== columnId);
      } else {
        return [...prev, columnId];
      }
    });
  };

  const handleExport = async function(): Promise<void> {
    if (!db) {
      toast.error('Database not initialized');
      return;
    }

    if (selectedColumns.length === 0) {
      toast.error('Please select at least one column');
      return;
    }

    setLoading(true);
    try {
      const costs = await db.getCostsByDateRange(startDate, endDate);
      
      if (costs.length === 0) {
        toast.error('No data found for the selected date range');
        setLoading(false);
        return;
      }

      const filename = `costs-export-${startDate.year}-${startDate.month}-${startDate.day}_to_${endDate.year}-${endDate.month}-${endDate.day}`;

      if (exportFormat === 'csv') {
        exportToCSV(costs, `${filename}.csv`);
        toast.success('Data exported to CSV successfully');
      } else {
        exportToPDF(costs, 'Costs Report', `${filename}.pdf`);
        toast.success('Data exported to PDF successfully');
      }

      onClose();
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Export Data</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Export Format
            </Typography>
            <RadioGroup
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'csv' | 'pdf')}
            >
              <FormControlLabel value="csv" control={<Radio />} label="CSV" />
              <FormControlLabel value="pdf" control={<Radio />} label="PDF" />
            </RadioGroup>
          </FormControl>

          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Date Range
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <TextField
              label="Start Year"
              type="number"
              value={startDate.year}
              onChange={(e) => setStartDate({ ...startDate, year: parseInt(e.target.value) || 2024 })}
              size="small"
            />
            <TextField
              label="Month"
              type="number"
              value={startDate.month}
              onChange={(e) => setStartDate({ ...startDate, month: parseInt(e.target.value) || 1 })}
              size="small"
              inputProps={{ min: 1, max: 12 }}
            />
            <TextField
              label="Day"
              type="number"
              value={startDate.day}
              onChange={(e) => setStartDate({ ...startDate, day: parseInt(e.target.value) || 1 })}
              size="small"
              inputProps={{ min: 1, max: 31 }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <TextField
              label="End Year"
              type="number"
              value={endDate.year}
              onChange={(e) => setEndDate({ ...endDate, year: parseInt(e.target.value) || 2024 })}
              size="small"
            />
            <TextField
              label="Month"
              type="number"
              value={endDate.month}
              onChange={(e) => setEndDate({ ...endDate, month: parseInt(e.target.value) || 1 })}
              size="small"
              inputProps={{ min: 1, max: 12 }}
            />
            <TextField
              label="Day"
              type="number"
              value={endDate.day}
              onChange={(e) => setEndDate({ ...endDate, day: parseInt(e.target.value) || 1 })}
              size="small"
              inputProps={{ min: 1, max: 31 }}
            />
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Select Columns
          </Typography>
          <FormGroup>
            {columns.map((column) => (
              <FormControlLabel
                key={column.id}
                control={
                  <Checkbox
                    checked={selectedColumns.includes(column.id)}
                    onChange={() => handleColumnToggle(column.id)}
                  />
                }
                label={column.label}
              />
            ))}
          </FormGroup>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleExport} variant="contained" disabled={loading}>
          {loading ? 'Exporting...' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

