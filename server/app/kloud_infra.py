class KloudInfra:
    def __init__(self, boto3_client_instance):
        pass

    def get_info(self):
        pass

    def get_parent_info(self):
        pass

    def get_children_info(self):
        pass

    def get_metadata(self):
        pass


class KloudVPC(KloudInfra):
    pass


class KloudSubnet(KloudInfra):
    pass


class KloudIGW(KloudInfra):
    pass


class KloudNGW(KloudInfra):
    pass


class KloudEC2(KloudInfra):
    pass