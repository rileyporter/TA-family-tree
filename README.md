# a3-kchq-vinodr-rileyemp2
===============

## Team Members

1. Kevin Quinn kchq@uw.edu
2. Vinod Rathnam vinodr@uw.edu
3. Riley Porter rileymp2@uw.edu

## Introductory Programming TA Family Tree

Our dataset is data relating to the teaching assistants hired for the introductory programming classes at the University of Washington.  TAs in this community are chosen based on a combination of their grades in the classes, technical skills, and a short interview to demonstrate their teaching abilities. After being hired, a new TA is integrated into the community with the idea that "parents" are their TAs from CSE142 and 143.  

The data is broken up into three relational tables, which we integrate into D3 as CSVs.  We got our data from the introductory programming TA database system, and we made sure that all of the tables that we used are public information. The tables included data about when the TAs were hired, how long they have been TAs have been working in the program and who the TAs had as their own TAs whent hey took the courses.

This visualization displays the hiring data and the "family" relationships between the TAs for the community spanning from 1998 through 2012.  Hovering and clicking the various nodes in the tree allows a user to explore smaller family trees within the larger structure, with encodings of position and color of links to provide more information.  There are options to view only subtrees of ancestors or decendants to a specific node, and also the ability to search for a specific node.  This allows for drilling down on smaller subsets of the data to see interesting patterns.


## Running Instructions

To run, visit the live interactive TA family tree here: [http://cse512-15s.github.io/a3-kchq-vinodr-rileymp2/](http://cse512-15s.github.io/a3-kchq-vinodr-rileymp2/)


## Story Board

[storyboard.pdf](Storyboard.pdf)


### Changes between Storyboard and the Final Implementation

From the Storyboard to the Final Implementation, we have both added and removed features.  

One feature we removed was a color encoding on the nodes based on which of the two introductory classes a particular TA had taught more often.  We had planned on encoding this as a binned color encoding on a divergent color scale.  We decided that this extra color encoding was distracting and made the visualization more complicated without adding very much extra information.  Another feature we removed was a size encoding on TA nodes to indicate how many quarters each TA had taught for.  We removed this feature for similar reasons; it made the visualization harder to read. The data is already very complex, and the challenge with this visualization was providing enough interesting information and context without crowding the already cluttered network of nodes.

One of the features we added was a tooltip on each node to provide some basic information and some of the context for that TA node lost by removing the size encoding.  Another feature we added was the ability to search the network for a particular node.  This search function either prints 'TA not found' for a name that doesn't match any of the nodes in the network, or scrolls and automatically selects the searched for node.  This makes using the visualization a lot easier since the network has a lot of nodes and spans many quarters.


## Development Process

The work was fairly easy to split up amongst group members, since we all have roughly the same set of skills.  We met together and developed the storyboard and also hooked the dataset into D3 to get a very basic graph network working.  After that, we had a list of features that we wanted to implement, so we developed a smaller contrived dataset and split up the features among the three of us.  After working separately on exploring each of the features for a few days, we met up again to integrate the features together, iterate on our design, and decide what was missing.  It was easy to work together in this way, because we could split up the features into three equal sets, and each explore one domain of D3.

We roughly spent 25 hours doing initial set-up and storyboarding, 15 hours working separately, and 15 hours merging and polishing our design.  Total, this was roughly 55 hours, split between 3 people.

The aspect that took the most time was definitely getting started with D3.  We spent a lot of time exploring the different models that D3 has and had some frustrating hours in the beginning where we were slowly figuring out how to integrate our data to the D3 directed force graph.  After we understood the D3 model and had our data loaded, we were able to add features, merge our features, iterate and finish our design fairly quickly.
