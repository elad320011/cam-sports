// import React, { useState } from 'react';
// import {
//   ScrollView,
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   FlatList,
// } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import axiosInstance from '@/utils/axios';
// import { useAuth } from '@/contexts/AuthContext';

// interface Source {
//   id: number;
//   source_type: 'Image' | 'Video';
//   source_url: string;
// }

// interface Section {
//   id: number;
//   sectionName: string;
//   sectionDescription: string;
//   sectionSources: Source[];
// }

// const PlanForm = (props: any) => {
//   const { logout, user } = useAuth();
//   const setAddMode = props.setAddMode;
//   const onUpdate = props.onUpdate; // Callback for updates
//   const initialData = props.initialData || {}; // Use initialData if provided
//   const [planName, setPlanName] = useState(initialData.name || '');
//   const [planDescription, setPlanDescription] = useState(initialData.description || '');
//   const [planSections, setPlanSections] = useState<Section[]>(
//     initialData.plan_sections
//       ? initialData.plan_sections.map((section: any) => ({
//           id: section.id || Date.now(), // Preserve existing ID or generate a new one
//           sectionName: section.name || '', // Map 'name' to 'sectionName'
//           sectionDescription: section.description || '', // Map 'description' to 'sectionDescription'
//           sectionSources: section.sources
//             ? section.sources.map((source: any) => ({
//                 id: source.id || Date.now(), // Preserve existing ID or generate a new one
//                 source_type: source.source_type || 'Image',
//                 source_url: source.source_url || '',
//               }))
//             : [],
//         }))
//       : [
//           {
//             id: Date.now(),
//             sectionName: '',
//             sectionDescription: '',
//             sectionSources: [{ id: Date.now(), source_type: 'Image', source_url: '' }],
//           },
//         ]
//   );
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);

//   const handleAddSection = () => {
//     setPlanSections([
//       ...planSections,
//       {
//         id: Date.now(),
//         sectionName: '',
//         sectionDescription: '',
//         sectionSources: [{ id: Date.now(), source_type: 'Image', source_url: '' }],
//       },
//     ]);
//   };

//   const handleRemoveSection = (sectionId: number) => {
//     setPlanSections(planSections.filter((section) => section.id !== sectionId));
//   };

//   const handleSectionInputChange = (
//     sectionId: number,
//     name: keyof Omit<Section, 'id' | 'sectionSources'>,
//     value: string
//   ) => {
//     const updatedSections = planSections.map((section) =>
//       section.id === sectionId ? { ...section, [name]: value } : section
//     );
//     setPlanSections(updatedSections);
//   };

//   const handleAddSource = (sectionId: number) => {
//     const updatedSections = planSections.map((section) =>
//       section.id === sectionId
//         ? {
//             ...section,
//             sectionSources: [
//               ...section.sectionSources,
//               { id: Date.now(), source_type: 'Image', source_url: '' },
//             ],
//           }
//         : section
//     );
//     setPlanSections(updatedSections);
//   };

//   const handleRemoveSource = (sectionId: number, sourceId: number) => {
//     const updatedSections = planSections.map((section) =>
//       section.id === sectionId
//         ? {
//             ...section,
//             sectionSources: section.sectionSources.filter(
//               (source) => source.id !== sourceId
//             ),
//           }
//         : section
//     );
//     setPlanSections(updatedSections);
//   };

//   const handleSourceInputChange = (
//     sectionId: number,
//     sourceId: number,
//     name: keyof Omit<Source, 'id'>,
//     value: string
//   ) => {
//     const updatedSections = planSections.map((section) =>
//       section.id === sectionId
//         ? {
//             ...section,
//             sectionSources: section.sectionSources.map((source) =>
//               source.id === sourceId ? { ...source, [name]: value } : source
//             ),
//           }
//         : section
//     );
//     setPlanSections(updatedSections);
//   };

//   const handleSubmit = () => {
//     const formattedSections = planSections.map((section) => {
//         const { id: sectionId, sectionName, sectionDescription, sectionSources } = section;
//         if (!sectionName) {
//             setErrorMessage("Each section must have a name.");
//             return null; // Skip invalid sections
//         }
//         const formattedSources = (sectionSources || []).map(({ id, ...sourceWithoutId }) => sourceWithoutId); // Ensure sectionSources is an array
//         return {
//             name: sectionName, // Ensure 'name' is included
//             description: sectionDescription,
//             sources: formattedSources,
//         };
//     }).filter(Boolean); // Remove null sections

//     if (formattedSections.length !== planSections.length) {
//         return; // Stop submission if there are invalid sections
//     }

//     const formData = {
//         plan_id: initialData.id, // Include plan_id in the payload for updates
//         name: planName,
//         description: planDescription,
//         team_id: user?.team_id,
//         plan_sections: formattedSections,
//     };

//     if (initialData.id) {
//         updatePlan(formData); // Call update API if editing
//     } else {
//         submitPlan(formData); // Call create API if adding
//     }
// };

//   const submitPlan = async (formData: any) => {
//     try {
//       const response = await axiosInstance.post('/training_plans/create', formData);

//       if (response.status === 201) {
//         // Cleanup the form
//         setPlanName('');
//         setPlanDescription('');
//         setPlanSections([
//           {
//             id: Date.now(),
//             sectionName: '',
//             sectionDescription: '',
//             sectionSources: [{ id: Date.now(), source_type: 'Image', source_url: '' }],
//           },
//         ]);

//         // Go back to the list view
//         setAddMode(false);
//       }
//     } catch (error: any) {
//       if ( error.response?.data?.message === 'Training plan with this name already exists') {
//         // Set the error message
//         console.error('Training plan with this name already exists');
//         setErrorMessage('A training plan with this name already exists. Please choose a different name.');
//       } else {
//         console.error('Error creating training plan:', error.response?.data || error.message);
//       }
//     }
//   };

//   const updatePlan = async (formData: any) => {
//     try {
//       const response = await axiosInstance.put('/training_plans/update', formData); // Send plan_id in the payload
//       if (response.status === 200) {
//         setAddMode(false);
//         if (onUpdate) {
//           onUpdate(formData); // Notify parent of the updated plan
//         }
//       }
//     } catch (error: any) {
//       console.error('Error updating training plan:', error.response?.data || error.message);
//     }
//   };

//   return (
//     <ScrollView style={styles.container}>
//       {errorMessage && (
//         <Text style={styles.errorText}>{errorMessage}</Text>
//       )}

//       <Text style={styles.label}>Plan Name:</Text>
//       <TextInput
//         style={styles.input}
//         value={planName}
//         onChangeText={setPlanName}
//         placeholder="Enter plan name"
//       />

//       <Text style={styles.label}>Plan Description:</Text>
//       <TextInput
//         style={[styles.input, styles.multilineInput]}
//         value={planDescription}
//         onChangeText={setPlanDescription}
//         placeholder="Enter plan description"
//         multiline
//         textAlignVertical="top"
//       />

//       <Text style={styles.sectionTitle}>Plan Sections
//         <TouchableOpacity style={styles.addButton} onPress={handleAddSection}>
//           <Text style={{ textAlign: 'right' }}>+</Text>
//         </TouchableOpacity>
//       </Text>

//       <div style={styles.divider}></div>

//       {planSections.map((section, index) => (
//         <View key={section.id} style={styles.sectionContainer}>
//           <Text style={styles.subTitle}>Section {index + 1}:</Text>
//           <TouchableOpacity
//             style={styles.removeButton}
//             onPress={() => handleRemoveSection(section.id)}
//           >
//             <Text style={styles.removeButtonText}>Remove Section</Text>
//           </TouchableOpacity>

//           <Text style={styles.label}>Section Name:</Text>
//           <TextInput
//             style={styles.input}
//             value={section.sectionName}
//             onChangeText={(text) =>
//               handleSectionInputChange(section.id, 'sectionName', text)
//             }
//             placeholder="Enter section name"
//           />

//           <Text style={styles.label}>Section Description:</Text>
//           <TextInput
//             style={[styles.input, styles.multilineInput]}
//             value={section.sectionDescription}
//             onChangeText={(text) =>
//               handleSectionInputChange(section.id, 'sectionDescription', text)
//             }
//             placeholder="Enter section description"
//             multiline
//             textAlignVertical="top"
//           />

//           <Text style={styles.subTitle}>Section Sources:
//             <TouchableOpacity
//               style={styles.addButtonSmall}
//               onPress={() => handleAddSource(section.id)}
//             >
//               <Text style={styles.subTitle}>+</Text>
//             </TouchableOpacity>
//           </Text>
//           {(section.sectionSources || []).map((source, sourceIndex) => (
//             <View key={source.id} style={styles.sourceContainer}>
//               <Text style={styles.sourceLabel}>Source {sourceIndex + 1}:</Text>
//               <TouchableOpacity
//                 style={styles.removeButtonSmall}
//                 onPress={() => handleRemoveSource(section.id, source.id)}
//               >
//                 <Text style={styles.removeButtonTextSmall}>Remove</Text>
//               </TouchableOpacity>

//               <Text style={styles.labelSmall}>Source Type:</Text>
//               <View style={styles.pickerContainer}>
//                 <Picker
//                   selectedValue={source.source_type}
//                   onValueChange={(itemValue) =>
//                     handleSourceInputChange(
//                       section.id,
//                       source.id,
//                       'source_type',
//                       itemValue
//                     )
//                   }
//                   style={styles.picker}
//                 >
//                   <Picker.Item label="Image" value="Image" />
//                   <Picker.Item label="Video" value="Video" />
//                 </Picker>
//               </View>

//               <Text style={styles.labelSmall}>Source URL:</Text>
//               <TextInput
//                 style={styles.inputSmall}
//                 value={source.source_url}
//                 onChangeText={(text) =>
//                   handleSourceInputChange(
//                     section.id,
//                     source.id,
//                     'source_url',
//                     text
//                   )
//                 }
//                 placeholder="Enter source URL"
//               />
//             </View>
//           ))}
//         </View>
//       ))}

//       <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
//         <Text style={styles.submitButtonText}>
//           {initialData.id ? "Change" : "Create"}
//         </Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   divider: {
//     margin: 5,
//   },
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#f4f4f4',
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 5,
//     color: '#333',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     padding: 10,
//     marginBottom: 15,
//     backgroundColor: '#fff',
//   },
//   multilineInput: {
//     minHeight: 80,
//     textAlignVertical: 'top',
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',

//     color: '#333',
//   },
//   sectionContainer: {
//     backgroundColor: '#e9e9e9',
//     padding: 15,
//     borderRadius: 5,
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: '#ddd',
//   },
//   subTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     color: '#555',
//   },
//   sourceContainer: {
//     backgroundColor: '#f9f9f9',
//     padding: 10,
//     borderRadius: 3,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: '#eee',
//   },
//   labelSmall: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     marginBottom: 3,
//     color: '#777',
//   },
//   inputSmall: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 3,
//     padding: 8,
//     marginBottom: 10,
//     backgroundColor: '#fff',
//   },
//   addButton: {
//     position: 'absolute',
//     right: 5,
//     top: 0,
//   },
//   removeButton: {
//     backgroundColor: '#d9534f',
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 5,
//     alignSelf: 'flex-start',
//     marginBottom: 10,
//   },
//   removeButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   addButtonSmall: {
//     alignSelf: 'flex-end',
//     position: 'absolute',
//     right: 5,
//   },
//   removeButtonSmall: {
//     backgroundColor: '#f0ad4e',
//     paddingVertical: 5,
//     paddingHorizontal: 8,
//     borderRadius: 3,
//     alignSelf: 'flex-end',
//     position: 'absolute',
//     top: 5,
//     right: 5,
//   },
//   removeButtonTextSmall: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 12,
//   },
//   submitButton: {
//     backgroundColor: '#007bff',
//     padding: 15,
//     borderRadius: 5,
//     alignItems: 'center',
//   },
//   submitButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 18,
//   },
//   pickerContainer: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 3,
//     marginBottom: 10,
//     backgroundColor: '#fff',
//   },
//   picker: {
//     height: 40,
//   },
//   sourceLabel: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     marginBottom: 3,
//     color: '#777',
//   },
//   errorText: {
//     color: 'red',
//     fontSize: 16,
//     marginBottom: 10,
//   },
// });

// export default PlanForm;
