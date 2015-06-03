## Team Members

1. Kevin Quinn kchq@uw.edu
2. Vinod Rathnam vinodr@uw.edu
3. Riley Porter rileymp2@uw.edu

## Introductory Programming TA Family Tree

Our dataset is data relating to the teaching assistants hired for the introductory programming classes at the University of Washington.  TAs in this community are chosen based on a combination of their grades in the classes, technical skills, and a short interview to demonstrate their teaching abilities. After being hired, a new TA is integrated into the community with the idea that "parents" are their TAs from CSE142 and 143.  

The data is broken up into three relational tables, which we integrate into D3 as CSVs.  We got our data from the introductory programming TA database system, and we made sure that all of the tables that we used are public information. The tables included data about when the TAs were hired, how long they have been TAs have been working in the program and who the TAs had as their own TAs whent hey took the courses.

This visualization displays the hiring data and the "family" relationships between the TAs for the community spanning from 1998 through 2012.  Hovering and clicking the various nodes in the tree allows a user to explore smaller family trees within the larger structure, with encodings of position and color of links to provide more information.  There are options to view only subtrees of ancestors or decendants to a specific node, and also the ability to search for a specific node.  This allows for drilling down on smaller subsets of the data to see interesting patterns.
