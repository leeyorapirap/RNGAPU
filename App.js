import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Text,
  View,
  StyleSheet,
  SectionList,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Searchbar } from 'react-native-paper';
import debounce from 'lodash.debounce';
import {
  createTable,
  getMenuItems,
  saveMenuItems,
  filterByQueryAndCategories,
} from './database';
import Filters from './components/Filters';
import { getSectionListData, useUpdateEffect } from './utils';

const API_URL =
  'https://api.github.com/repos/leeyorapirap/RNGAPU/contents/data.json';
const sections = ['Appetizers', 'Salads', 'Beverages'];


const Item = ({ title, price, index }) => (
  <View key={index} style={styles.item}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.title}>${price}</Text>
  </View>
);

export default function App() {
  const [data, setData] = useState([]);
  const [searchBarText, setSearchBarText] = useState('');
  const [query, setQuery] = useState('');
  const [filterSelections, setFilterSelections] = useState(
    sections.map(() => false)
  );

  const fetchData = async() => {
    // 1. Implement this function
    
    // Fetch the menu from the API_URL endpoint. You can visit the API_URL in your browser to inspect the data returned
    // The category field comes as an object with a property called "title". You just need to get the title value and set it under the key "category".
    // So the server response should be slighly transformed in this function (hint: map function) to flatten out each menu item in the array,
    return [];
  }

  useEffect(() => {
    (async () => {
      try {
        await createTable();
        let menuItems = await getMenuItems();

        // The application only fetches the menu data once from a remote URL
        // and then stores it into a SQLite database.
        // After that, every application restart loads the menu from the database
        if (!menuItems.length) {
          const menuItems = await fetchData();
          saveMenuItems(menuItems);
        }

        const sectionListData = getSectionListData(menuItems);
        setData(sectionListData);
      } catch (e) {
        // Handle error
        Alert.alert(e.message);
      }
    })();
  }, []);

  // useUpdateEffect(() => {
  //   (async () => {
  //     const activeCategories = sections.filter((s, i) => {
  //       // If all filters are deselected, all categories are active
  //       if (filterSelections.every((item) => item === false)) {
  //         return true;
  //       }
  //       return filterSelections[i];
  //     });
  //     try {
  //       const menuItems = await filterByQueryAndCategories(
  //         query,
  //         activeCategories
  //       );
  //       const sectionListData = getSectionListData(menuItems);
  //       setData(sectionListData);
  //     } catch (e) {
  //       Alert.alert(e.message);
  //     }
  //   })();
  // }, [filterSelections, query]);
  useUpdateEffect(() => {
    (async () => {
      const activeCategories = sections.filter((s, i) => filterSelections[i]);
      console.log('Active categories:', activeCategories);
      try {
        const menuItems = await filterByQueryAndCategories(
          query,
          activeCategories
        );
        const sectionListData = getSectionListData(menuItems);
        setData(sectionListData);
      } catch (e) {
        Alert.alert(e.message);
      }
    })();
  }, [filterSelections, query]);

  const lookup = useCallback((q) => {
    setQuery(q);
  }, []);

  const debouncedLookup = useMemo(() => debounce(lookup, 500), [lookup]);

  const handleSearchChange = (text) => {
    setSearchBarText(text);
    debouncedLookup(text);
  };

  // const handleFiltersChange = async (index) => {
  //   const arrayCopy = [...filterSelections];
  //   arrayCopy[index] = !filterSelections[index];
  //   setFilterSelections(arrayCopy);
  // };
  const handleFiltersChange = async (index) => {
    const arrayCopy = [...filterSelections];
    arrayCopy[index] = !filterSelections[index];
    setFilterSelections(arrayCopy);
    console.log('Updated filterSelections:', arrayCopy);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Searchbar
        placeholder="Search"
        placeholderTextColor="white"
        onChangeText={handleSearchChange}
        value={searchBarText}
        style={styles.searchBar}
        iconColor="white"
        inputStyle={{ color: 'white' }}
        elevation={0}
      />
      <Filters
        selections={filterSelections}
        onChange={handleFiltersChange}
        sections={sections}
      />
      {/* <SectionList
        style={styles.sectionList}
        sections={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Item title={item.title} price={item.price} />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.header}>{title}</Text>
        )}
      /> */}
    <SectionList
      style={styles.sectionList}
      sections={data}
      keyExtractor={(item, index) => index.toString()} // Use index as the key
      renderItem={({ item, index }) => ( // Add index as a parameter
        <Item title={item.title} price={item.price} index={index} /> // Pass the index as the key prop
      )}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.header}>{title}</Text>
      )}
    />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    backgroundColor: '#495E57',
  },
  sectionList: {
    paddingHorizontal: 16,
  },
  searchBar: {
    marginBottom: 24,
    backgroundColor: '#495E57',
    shadowRadius: 0,
    shadowOpacity: 0,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  header: {
    fontSize: 20,
    paddingVertical: 8,
    color: '#FBDABB',
    backgroundColor: '#495E57',
  },
  title: {
    fontSize: 18,
    color: 'white',
  },
});
