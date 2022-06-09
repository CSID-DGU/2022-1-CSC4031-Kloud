ids=$(docker ps -a -q)
for id in $ids
do
 echo "$id"
 docker kill $id && docker rm $id
done
