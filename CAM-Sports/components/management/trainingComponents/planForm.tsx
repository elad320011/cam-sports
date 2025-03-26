import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axiosInstance from '@/utils/axios';
import { useAuth } from '@/contexts/AuthContext';

interface Source {
  id: number;
  source_type: 'Image' | 'Video';
  source_url: string;
}

interface Section {
  id: number;
  sectionName: string;
  sectionDescription: string;
  sectionSources: Source[];
}

const PlanForm = (props: any) => {
  const { logout, userInfo } = useAuth();
  const setAddMode = props.setAddMode;
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [planSections, setPlanSections] = useState<Section[]>([
    {
      id: Date.now(),
      sectionName: '',
      sectionDescription: '',
      sectionSources: [{ id: Date.now(), source_type: 'Image', source_url: '' }],
    },
  ]);

  const handleAddSection = () => {
    setPlanSections([
      ...planSections,
      {
        id: Date.now(),
        sectionName: '',
        sectionDescription: '',
        sectionSources: [{ id: Date.now(), source_type: 'Image', source_url: '' }],
      },
    ]);
  };

  const handleRemoveSection = (sectionId: number) => {
    setPlanSections(planSections.filter((section) => section.id !== sectionId));
  };

  const handleSectionInputChange = (
    sectionId: number,
    name: keyof Omit<Section, 'id' | 'sectionSources'>,
    value: string
  ) => {
    const updatedSections = planSections.map((section) =>
      section.id === sectionId ? { ...section, [name]: value } : section
    );
    setPlanSections(updatedSections);
  };

  const handleAddSource = (sectionId: number) => {
    const updatedSections = planSections.map((section) =>
      section.id === sectionId
        ? {
            ...section,
            sectionSources: [
              ...section.sectionSources,
              { id: Date.now(), source_type: 'Image', source_url: '' },
            ],
          }
        : section
    );
    setPlanSections(updatedSections);
  };

  const handleRemoveSource = (sectionId: number, sourceId: number) => {
    const updatedSections = planSections.map((section) =>
      section.id === sectionId
        ? {
            ...section,
            sectionSources: section.sectionSources.filter(
              (source) => source.id !== sourceId
            ),
          }
        : section
    );
    setPlanSections(updatedSections);
  };

  const handleSourceInputChange = (
    sectionId: number,
    sourceId: number,
    name: keyof Omit<Source, 'id'>,
    value: string
  ) => {
    const updatedSections = planSections.map((section) =>
      section.id === sectionId
        ? {
            ...section,
            sectionSources: section.sectionSources.map((source) =>
              source.id === sourceId ? { ...source, [name]: value } : source
            ),
          }
        : section
    );
    setPlanSections(updatedSections);
  };

  const handleSubmit = () => {
    // remove ID and adjust keys to match backend expectations
    const formattedSections = planSections.map((section) => {
      const {
        id: sectionId,
        sectionName,
        sectionDescription,
        sectionSources,
        ...restOfSection
      } = section;
      const formattedSources = sectionSources.map((source) => {
        const { id: sourceId, ...sourceWithoutId } = source;
        return sourceWithoutId;
      });
      return {
        name: sectionName, // Backend expects 'name' for section
        description: sectionDescription, // Backend expects 'description' for section
        sources: formattedSources, // Backend expects 'sources' for section sources
        ...restOfSection,
      };
    });

    const formData = {
      name: planName, // Backend expects 'name' for the plan
      description: planDescription, // Backend expects 'description' for the plan
      team_id: userInfo?.team_id,
      plan_sections: formattedSections,
    };
    console.log('Form Data:', formData);
    submitPlan(formData);
  };

  const submitPlan = async (formData: any) => {
    try {
      const response = await axiosInstance.post('/training_plans/create', formData);

      if (response.status === 201) {

        // cleanup the form
        setPlanName('');
        setPlanDescription('');
        setPlanSections([
          {
            id: Date.now(),
            sectionName: '',
            sectionDescription: '',
            sectionSources: [{ id: Date.now(), source_type: 'Image', source_url: '' }],
          },
        ]);

        // go back to the list view
        setAddMode(false);
      }
      // Optionally, you can navigate the user or show a success message here
    } catch (error: any) {
      console.error('Error creating training plan:', error.response?.data || error.message);
      // Optionally, you can show an error message to the user
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Plan Name:</Text>
      <TextInput
        style={styles.input}
        value={planName}
        onChangeText={setPlanName}
        placeholder="Enter plan name"
      />

      <Text style={styles.label}>Plan Description:</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        value={planDescription}
        onChangeText={setPlanDescription}
        placeholder="Enter plan description"
        multiline
        textAlignVertical="top"
      />

      <Text style={styles.sectionTitle}>Plan Sections
        <TouchableOpacity style={styles.addButton} onPress={handleAddSection}>
          <Text style={{textAlign: 'right'}}>+</Text>
        </TouchableOpacity>
      </Text>

      <div style={styles.divider}></div>

      {planSections.map((section, index) => (
        <View key={section.id} style={styles.sectionContainer}>
          <Text style={styles.subTitle}>Section {index + 1}:</Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveSection(section.id)}
          >
            <Text style={styles.removeButtonText}>Remove Section</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Section Name:</Text>
          <TextInput
            style={styles.input}
            value={section.sectionName}
            onChangeText={(text) =>
              handleSectionInputChange(section.id, 'sectionName', text)
            }
            placeholder="Enter section name"
          />

          <Text style={styles.label}>Section Description:</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={section.sectionDescription}
            onChangeText={(text) =>
              handleSectionInputChange(section.id, 'sectionDescription', text)
            }
            placeholder="Enter section description"
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.subTitle}>Section Sources:
              <TouchableOpacity
              style={styles.addButtonSmall}
              onPress={() => handleAddSource(section.id)}
            >
              <Text style={styles.subTitle}>+</Text>
            </TouchableOpacity>
          </Text>
          {section.sectionSources.map((source, sourceIndex) => (
            <View key={source.id} style={styles.sourceContainer}>
              <Text style={styles.sourceLabel}>Source {sourceIndex + 1}:</Text>
              <TouchableOpacity
                style={styles.removeButtonSmall}
                onPress={() => handleRemoveSource(section.id, source.id)}
              >
                <Text style={styles.removeButtonTextSmall}>Remove</Text>
              </TouchableOpacity>

              <Text style={styles.labelSmall}>Source Type:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={source.source_type}
                  onValueChange={(itemValue) =>
                    handleSourceInputChange(
                      section.id,
                      source.id,
                      'source_type',
                      itemValue
                    )
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Image" value="Image" />
                  <Picker.Item label="Video" value="Video" />
                </Picker>
              </View>

              <Text style={styles.labelSmall}>Source URL:</Text>
              <TextInput
                style={styles.inputSmall}
                value={source.source_url}
                onChangeText={(text) =>
                  handleSourceInputChange(
                    section.id,
                    source.id,
                    'source_url',
                    text
                  )
                }
                placeholder="Enter source URL"
              />
            </View>
          ))}
        </View>
      ))}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Create</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  divider: {
    margin: 5,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',

    color: '#333',
  },
  sectionContainer: {
    backgroundColor: '#e9e9e9',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#555',
  },
  sourceContainer: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 3,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  labelSmall: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#777',
  },
  inputSmall: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 3,
    padding: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  addButton: {
    position: 'absolute',
    right: 5,
    top: 0,
  },
  removeButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  addButtonSmall: {
    alignSelf: 'flex-end',
    position: 'absolute',
    right: 5,
  },
  removeButtonSmall: {
    backgroundColor: '#f0ad4e',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 3,
    alignSelf: 'flex-end',
    position: 'absolute',
    top: 5,
    right: 5,
  },
  removeButtonTextSmall: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 3,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  picker: {
    height: 40,
  },
  sourceLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#777',
  },
});

export default PlanForm;
