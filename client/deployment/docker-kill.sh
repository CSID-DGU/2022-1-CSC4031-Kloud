ids=$(docker ps -a -q)
for id in $ids
do
 echo "$id"
 docker kill $id
done
