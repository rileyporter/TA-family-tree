import java.io.*;
import java.util.*;

public class Parser {
	public static void main(String[] args) throws FileNotFoundException {
		Map<String, Integer> taMap = loadTAs();
		PrintStream output = new PrintStream(new File("updated_family_data.csv"));
		outputOldFamilyData(output);
		loadNewFamilyData(taMap, 280, output);
	}

	public static Map<String, Integer> loadTAs() throws FileNotFoundException {
		Map<String, Integer> taMap = new HashMap<String, Integer>();
		Scanner input = new Scanner(new File("tas_3.csv"));
		while (input.hasNextLine()) {
			Scanner nextTa = new Scanner(input.nextLine()).useDelimiter(",");
			while (nextTa.hasNext()) {
				String id = stripQuotes(nextTa.next());
				String name = stripQuotes(nextTa.next()) + " " + stripQuotes(nextTa.next());
				taMap.put(name, Integer.parseInt(id));
				break;
			}
		}
		return taMap;
	}

	public static void outputOldFamilyData(PrintStream output) throws FileNotFoundException {
		// family ID, 142, 143, 190, TA => family ID, 142, 143, 190, TA, 143X
		Scanner input = new Scanner(new File("tas_family.csv"));
		while (input.hasNextLine()) {
			output.println(input.nextLine() + ",NULL");
		}
	}

	public static void loadNewFamilyData(Map<String, Integer> taMap,
			int family, PrintStream output) throws FileNotFoundException {
		// input: TA	142	143	143X	154/190M
		// output: family ID, 142, 143, 190, TA, 143X
		Scanner input = new Scanner(new File("new_data.csv"));
		while (input.hasNextLine()) {
			Scanner nextTa = new Scanner(input.nextLine()).useDelimiter(",");
			String ta = nextTa.next();
			String p142 = formatName(nextTa.next(), taMap);
			String p143 = formatName(nextTa.next(), taMap);
			String p143X = formatName(nextTa.next(), taMap);
			String p154 = formatName(nextTa.next(), taMap);
			String taId = formatName(ta, taMap);
			if (taMap.containsKey(ta)) {
				output.println("\"" + family + "\"," + p142 + "," + p143 +
						"," + p154 + "," + taId + "," + p143X);
				family++;
			}
		}
	}

	public static String stripQuotes(String token) {
		return token.substring(1, token.length() - 1);
	}

	public static String formatName(String name, Map<String, Integer> taMap) {
		if (name.startsWith("-")) {
			return "NULL";
		} else {
			if (!taMap.containsKey(name)) {
				return "NULL";
			} else {
				return "\"" + taMap.get(name) + "\"";
			}
		}
	}
}