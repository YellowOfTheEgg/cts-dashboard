#  Clustering Tool Set Dashboard

This project is a web application designed to offer a suite of tools for clustering, evaluating clusterings, and detecting outliers in time series data. With a user-friendly frontend, you can easily visualize the results of your analyses or download them for further use. The toolset is tailored to handle time series data over time, ensuring robust performance and accuracy in identifying patterns, anomalies, and meaningful groupings within your data.



# Requirements
To run the application locally you need to have installed following applications:
- Ubuntu >= 20.04
- Docker Compose version = 2.3.3
- Docker version = 20.10.13

# Getting started
To start the application just run following command within the project folder:
```
./run.sh
```
After the installation process, the application can be accessed over:
```
http://localhost:3000
```
The configuration area for a method (e.g. MOSCAT) of the web application looks as follows:

![Alt text](readme_images/cts-dashboard_1.PNG?raw=true "Configuration Area")

The output area of the dashboard is as follows: 

![Alt text](readme_images/cts-dashboard_2.PNG?raw=true "Output Area")

To stop the application run following command within the project folder:
```
./stop.sh
```
This stops frontend and backend service and remove created container.

# List of supported Publications
<a id="1">[[1]](http://www.ibai-publishing.org/html/proceedings_2020/pdf/proceedings_book_MLDM_2020.pdf)</a>
Tatusch, M., Klassen, G., Bravidor, M., and Conrad, S. 
**How is Your Team Spirit? Cluster Over-Time Stability Evaluation**.  
In: _Machine Learning and Data Mining in Pattern Recognition, 16th International Conference on Machine Learning and
Data Mining, MLDM 2020_, pages 155–170.

<a id="2">[[2]](https://link.springer.com/chapter/10.1007/978-981-15-1699-3_8)</a>
Tatusch, M., Klassen, G., Bravidor, M., and Conrad, S. 
**Show me your friends and i’ll tell you who you are. Finding anomalous time series by conspicuous clus-
ter transitions**.  
In: _Data Mining. AusDM 2019. Communications in Computer and Information Science_, pages 91–103.

<a id="3">[[3]](https://link.springer.com/chapter/10.1007/978-3-030-59065-9_26)</a>
Tatusch, M., Klassen, G., and Conrad, S.  
**Behave or be detected! Identifying outlier sequences by their group cohesion**.  
In: _Big Data Analytics and KnowledgeDiscovery, 22nd International Conference, DaWaK 2020_, pages 333–347.

<a id="4">[[4]](https://link.springer.com/chapter/10.1007%2F978-3-030-65390-3_28)</a>
Tatusch, M., Klassen, G., and Conrad, S.
**Loners stand out. Identification of anomalous subsequences based on group performance**.  
In: _Advanced Data Mining and Applications, ADMA 2020_, pages 360–369.

<a id="5">[[5]](https://ieeexplore.ieee.org/document/9308516) 
Klassen, G., Tatusch, M., and Conrad, S.   
**Clustering of time series regarding their over-time stability**.  
In: _Proceedings of the 2020 IEEE Symposium Series on Computational Intelligence (SSCI)_, pages 1051–1058.

<a id="6">[[6]](https://doi.org/10.3390/engproc2022018003) 
Korlakov, S., Klassen, G., Bravidor, M., Conrad, S.:
**Alone We Can Do So Little; Together We Cannot Be Detected**.
In: Engineering Proceedings 18.1, 8th International conference on Time Series and Forecasting, ITISE 2022.

<a id="7">[[7]](https://doi.org/10.3390/engproc2024068048) 
Korlakov, S., Klassen, G., Bauer, L., Conrad, S.:
**Multi-Objective Optimisation for the Selection of Clusterings across Time**.
In: Engineering Proceedings 68.1, 10th International conference on Time Series and Forecasting, ITISE 2024.
